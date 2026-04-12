import Image from 'next/image';
import Link from 'next/link';

type WebBrandMarkProps = {
  href?: string;
  size?: 'nav' | 'hero' | 'featured';
  showText?: boolean;
  textClassName?: string;
  className?: string;
};

export default function WebBrandMark({
  href = '/',
  size = 'nav',
  showText = true,
  textClassName = 'text-zinc-900',
  className = '',
}: WebBrandMarkProps) {
  const imageSize = size === 'hero' ? 132 : size === 'featured' ? 126 : 52;
  const imageClassName = size === 'hero'
    ? 'h-28 w-28 object-contain'
    : size === 'featured'
      ? 'h-[126px] w-[126px] object-contain'
      : 'h-[52px] w-[52px] object-contain';
  const textSizeClass = size === 'hero' ? 'text-4xl' : size === 'featured' ? 'text-2xl' : 'text-lg';

  return (
    <Link href={href} className={`inline-flex items-center gap-3 leading-none font-bold ${textSizeClass} ${textClassName} ${className}`}>
      <Image
        src="/buildvault-logo-professional.png"
        alt="BuildVault Logo"
        width={imageSize}
        height={imageSize}
        className={imageClassName}
        priority
      />
      {showText ? <span>BuildVault</span> : null}
    </Link>
  );
}