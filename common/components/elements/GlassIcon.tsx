export interface GlassIconProps {
  name: string;
  icon: JSX.Element;
  background: string;
}

const GlassIcon: React.FC<GlassIconProps> = ({ name, icon, background }) => {
  return (
    <button
      data-responsive-skill
      type="button"
      aria-label={name}
      className="group relative h-[2.6em] w-[2.6em] bg-transparent outline-none [-webkit-tap-highlight-color:transparent] md:h-[3em] md:w-[3em]"
    >
      <span
        aria-hidden="true"
        className={`absolute left-0 top-0 block h-full w-full origin-[100%_100%] rotate-[15deg] rounded-[1.25em] ${background}`}
      />
      <span className="absolute left-0 top-0 flex h-full w-full overflow-hidden rounded-[1.25em] bg-[Canvas]">
        <span
          aria-hidden="true"
          className={`skill-glass-texture absolute inset-0 ${background}`}
        />
        <span
          aria-hidden="true"
          className="absolute inset-0 rounded-[inherit] bg-[hsla(0,0%,100%,0.15)]"
          style={{ boxShadow: "0 0 0 0.1em hsla(0, 0%, 100%, 0.3) inset" }}
        />
        <span
          className="relative m-auto flex h-[1.5em] w-[1.5em] items-center justify-center"
          aria-hidden="true"
        >
          {icon}
        </span>
      </span>
      <span className="absolute left-0 right-0 top-full translate-y-[20%] whitespace-nowrap text-center text-sm leading-[2] opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100">
        {name}
      </span>
    </button>
  );
};

export default GlassIcon;
