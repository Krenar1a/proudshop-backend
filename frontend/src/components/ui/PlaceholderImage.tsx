import Image from 'next/image'

interface PlaceholderImageProps {
  alt: string
  className?: string
  width?: number
  height?: number
  src?: string
}

export default function PlaceholderImage({ 
  alt, 
  className = "w-full h-full object-cover", 
  width = 400, 
  height = 400,
  src 
}: PlaceholderImageProps) {
  const fallbackSrc = '/placeholder-image.svg'
  
  return (
    <Image
      src={src || fallbackSrc}
      alt={alt}
      width={width}
      height={height}
      className={className}
      onError={(e) => {
        e.currentTarget.src = fallbackSrc
      }}
      priority={false}
    />
  )
}
