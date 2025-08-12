from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr
from typing import List, Optional
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.dependencies import get_current_admin
from app.models.admin import AdminSetting
import re
import os
import logging
logger = logging.getLogger(__name__)


router = APIRouter(prefix="/emails", tags=["emails"])


class EmailSendIn(BaseModel):
    to: List[EmailStr]
    subject: str
    html: str
    from_email: Optional[EmailStr] = None
    from_name: Optional[str] = None


def _get_setting(db: Session, key: str) -> Optional[str]:
    s = db.query(AdminSetting).filter(AdminSetting.key == key).first()
    return s.value if s else None


def send_email_with_settings(
    db: Session,
    to: list[str],
    subject: str,
    html: str,
    from_email: Optional[str] = None,
    from_name: Optional[str] = None,
) -> bool:
    host = _get_setting(db, "smtp_host")
    port_str = _get_setting(db, "smtp_port") or "587"
    secure_str = _get_setting(db, "smtp_secure") or "false"
    user = _get_setting(db, "smtp_user")
    password = _get_setting(db, "smtp_password")
    from_email = from_email or _get_setting(db, "smtp_from_email") or user
    from_name = from_name or _get_setting(db, "smtp_from_name") or "ProudShop"

    if not host or not user or not password or not from_email:
        return False

    try:
        port = int(port_str)
    except ValueError:
        port = 587

    secure = str(secure_str).lower() in ("1", "true", "yes", "on")

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = f"{from_name} <{from_email}>"
    msg["To"] = ", ".join(to)
    msg.attach(MIMEText(html, "html", _charset="utf-8"))

    try:
        if secure and port == 465:
            with smtplib.SMTP_SSL(host, port) as server:
                server.login(user, password)
                server.sendmail(from_email, to, msg.as_string())
        else:
            with smtplib.SMTP(host, port) as server:
                server.ehlo()
                try:
                    server.starttls()
                    server.ehlo()
                except smtplib.SMTPException:
                    pass
                server.login(user, password)
                server.sendmail(from_email, to, msg.as_string())
    except Exception:
        return False
    return True


def _mask_user(u: str | None):
    if not u:
        return None
    # mask everything before @ except first and last char
    parts = u.split('@', 1)
    local = parts[0]
    if len(local) <= 2:
        masked_local = local[0] + '*'
    else:
        masked_local = local[0] + ('*' * (len(local)-2)) + local[-1]
    return masked_local + ('@'+parts[1] if len(parts) == 2 else '')


@router.get("/check")
def check_email_settings(db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    """Lightweight diagnostics for SMTP configuration (does NOT send an email)."""
    host = _get_setting(db, "smtp_host")
    port = _get_setting(db, "smtp_port")
    secure = _get_setting(db, "smtp_secure")
    user = _get_setting(db, "smtp_user")
    password = _get_setting(db, "smtp_password")
    from_email = _get_setting(db, "smtp_from_email") or user
    missing = [k for k, v in {
        'smtp_host': host,
        'smtp_user': user,
        'smtp_password': password,
    }.items() if not v]
    return {
        'ok': len(missing) == 0,
        'missing': missing,
        'config': {
            'host': host,
            'port': port,
            'secure': secure,
            'user_masked': _mask_user(user),
            'from_email_masked': _mask_user(from_email),
            'has_password': bool(password),
        }
    }


@router.post("/send")
def send_email(payload: EmailSendIn, db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    host = _get_setting(db, "smtp_host")
    port_str = _get_setting(db, "smtp_port") or "587"
    secure_str = _get_setting(db, "smtp_secure") or "false"
    user = _get_setting(db, "smtp_user")
    password = _get_setting(db, "smtp_password")
    from_email = payload.from_email or _get_setting(db, "smtp_from_email") or user
    from_name = payload.from_name or _get_setting(db, "smtp_from_name") or "ProudShop"

    if not host or not user or not password or not from_email:
        raise HTTPException(status_code=400, detail="SMTP settings are not configured")

    try:
        port = int(port_str)
    except ValueError:
        port = 587

    secure = str(secure_str).lower() in ("1", "true", "yes", "on")

    # Build message
    msg = MIMEMultipart("alternative")
    msg["Subject"] = payload.subject
    msg["From"] = f"{from_name} <{from_email}>"
    msg["To"] = ", ".join(payload.to)
    msg.attach(MIMEText(payload.html, "html", _charset="utf-8"))

    # Quick password whitespace warning (common copy/paste issue)
    if password and (password != password.strip()):
        raise HTTPException(status_code=400, detail="SMTP password ka hapësira në fillim/fund. Hiq ato dhe ruaj përsëri.")

    debug_mode = os.getenv('SMTP_DEBUG') in ('1', 'true', 'True')
    try:
        if secure and port == 465:
            with smtplib.SMTP_SSL(host, port, timeout=20) as server:
                if debug_mode:
                    server.set_debuglevel(1)
                server.login(user, password)
                server.sendmail(from_email, payload.to, msg.as_string())
        else:
            with smtplib.SMTP(host, port, timeout=20) as server:
                if debug_mode:
                    server.set_debuglevel(1)
                server.ehlo()
                # Only attempt STARTTLS if port commonly supports it
                if port in (587, 25, 2525):
                    try:
                        server.starttls()
                        server.ehlo()
                    except smtplib.SMTPException:
                        pass
                server.login(user, password)
                server.sendmail(from_email, payload.to, msg.as_string())
    except smtplib.SMTPAuthenticationError as e:
        logger.warning("SMTP auth failed code=%s error=%s", getattr(e, 'smtp_code', None), getattr(e, 'smtp_error', None))
        hint = "SMTP authentication failed (535). Kontrolloni user/password. Për Hostinger: përdorni password të llogarisë së email-it (jo panelit) dhe username adresën e plotë."
        raise HTTPException(status_code=500, detail=hint)
    except smtplib.SMTPException as e:
        raise HTTPException(status_code=500, detail=f"SMTP error: {type(e).__name__}: {e}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected email error: {type(e).__name__}: {e}")


@router.get("/auth-matrix")
def smtp_auth_matrix(db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    """Try multiple common SMTP connection/auth strategies to diagnose failures."""
    host = _get_setting(db, "smtp_host")
    port_setting = _get_setting(db, "smtp_port")
    secure_setting = _get_setting(db, "smtp_secure")
    user = _get_setting(db, "smtp_user")
    password = _get_setting(db, "smtp_password")
    results = []
    if not (host and user and password):
        raise HTTPException(status_code=400, detail="Missing smtp_host|smtp_user|smtp_password")

    def attempt(name: str, mode: str, host: str, port: int, starttls: bool):
        from time import time
        t0 = time()
        try:
            if mode == 'SSL':
                with smtplib.SMTP_SSL(host, port, timeout=15) as server:
                    server.login(user, password)
            else:
                with smtplib.SMTP(host, port, timeout=15) as server:
                    server.ehlo()
                    if starttls:
                        server.starttls(); server.ehlo()
                    server.login(user, password)
            ok = True
            err = None
        except Exception as e:  # broad for diagnostics only
            ok = False
            err = f"{type(e).__name__}: {e}"[:300]
        results.append({
            'name': name,
            'host': host,
            'port': port,
            'mode': mode,
            'starttls': starttls,
            'success': ok,
            'error': err,
        })

    # Strategy list (ordered)
    strategies = []
    try:
        configured_port = int(port_setting) if port_setting else None
    except ValueError:
        configured_port = None
    configured_secure = (str(secure_setting).lower() == 'true') if secure_setting is not None else None

    # Add the configured combo first
    if configured_port is not None and configured_secure is not None:
        if configured_secure and configured_port == 465:
            strategies.append(("configured-ssl-465", 'SSL', configured_port, False))
        elif configured_secure and configured_port != 465:
            strategies.append(("configured-ssl", 'SSL', configured_port, False))
        elif not configured_secure and configured_port in (587, 25, 2525):
            strategies.append(("configured-starttls", 'PLAIN', configured_port, True))
        else:
            strategies.append(("configured-plain", 'PLAIN', configured_port, False))

    # Common fallbacks
    if (configured_port, configured_secure) != (465, True):
        strategies.append(("ssl-465", 'SSL', 465, False))
    if (configured_port, configured_secure) != (587, False):
        strategies.append(("starttls-587", 'PLAIN', 587, True))
    if (configured_port, configured_secure) != (587, True):
        strategies.append(("ssl-587(forced)", 'SSL', 587, False))
    if (configured_port, configured_secure) != (25, False):
        strategies.append(("plain-25", 'PLAIN', 25, False))

    # Execute attempts
    for name, mode, port, starttls in strategies:
        attempt(name, mode, host, port, starttls)

    return {
        'user_masked': _mask_user(user),
        'attempts': results,
        'hint': 'Zakonisht Hostinger: SSL 465 ose STARTTLS 587. Sigurohuni që password është korrekt (pa hapësira) dhe përdorni adresën e plotë si username.'
    }

    return {"ok": True, "sent": len(payload.to)}
