import WebBrandMark from './WebBrandMark';

type WebPageBrandHeaderProps = {
  title: string;
  subtitle?: string;
  centered?: boolean;
  textClassName?: string;
  subtitleClassName?: string;
};

export default function WebPageBrandHeader({
  title,
  subtitle,
  centered = true,
  textClassName = 'text-zinc-900',
  subtitleClassName = 'text-zinc-500',
}: WebPageBrandHeaderProps) {
  return (
    <div className={centered ? 'text-center' : ''}>
      <div className={centered ? 'mb-3 flex justify-center' : 'mb-3'}>
        <WebBrandMark size="hero" showText={false} textClassName={textClassName} />
      </div>
      <h1 className={`text-4xl font-bold md:text-5xl ${textClassName}`}>{title}</h1>
      {subtitle ? <p className={`mx-auto mt-2 max-w-2xl text-base md:text-lg ${subtitleClassName}`}>{subtitle}</p> : null}
    </div>
  );
}