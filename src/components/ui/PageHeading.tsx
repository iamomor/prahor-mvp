export function PageHeading({eyebrow,title,description}:{eyebrow:string;title:string;description:string}) {
  return <header className="mb-8 max-w-3xl"><p className="pro-eyebrow mb-3">{eyebrow}</p><h1 className="pro-editorial mb-4 text-4xl sm:text-5xl">{title}</h1><p className="pro-muted text-base sm:text-lg">{description}</p></header>;
}
