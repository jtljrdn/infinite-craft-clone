import { cn } from "@/lib/utils";

type ParticleStyle = React.CSSProperties & Record<`--${string}`, string>;

type Particle = {
  kind: "star" | "dot";
  angle: number;
  distance: number;
  size: number;
  delay: number;
  bright: boolean;
};

const STARS: Particle[] = Array.from({ length: 12 }, (_, i) => ({
  kind: "star",
  angle: i * 30 + (i % 2 ? 9 : -7),
  distance: 64 + (i % 3) * 18,
  size: 9 + (i % 3) * 3,
  delay: (i % 4) * 40,
  bright: i % 2 === 0,
}));

const DOTS: Particle[] = Array.from({ length: 10 }, (_, i) => ({
  kind: "dot",
  angle: i * 36 + 18,
  distance: 92 + (i % 2) * 26,
  size: 4 + (i % 2) * 2,
  delay: 80 + (i % 3) * 50,
  bright: i % 2 === 1,
}));

const PARTICLES = [...STARS, ...DOTS];

export function DiscoveryBurst() {
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute inset-0 motion-reduce:hidden"
    >
      <span className="absolute inset-0 animate-discovery-ring rounded-[inherit] border-2 border-discovery-border" />
      <span className="absolute inset-0 animate-discovery-ring rounded-[inherit] border border-discovery-spark [animation-delay:180ms]" />
      {PARTICLES.map((particle, index) => {
        const style: ParticleStyle = {
          width: particle.size,
          height: particle.size,
          marginLeft: -particle.size / 2,
          marginTop: -particle.size / 2,
          "--angle": `${particle.angle}deg`,
          "--distance": `${particle.distance}px`,
          animationDelay: `${particle.delay}ms`,
        };
        return (
          <span
            key={index}
            style={style}
            className={cn(
              "absolute top-1/2 left-1/2",
              particle.bright ? "bg-discovery-spark" : "bg-discovery-border",
              particle.kind === "star"
                ? "animate-discovery-star [clip-path:polygon(50%_0%,62%_38%,100%_50%,62%_62%,50%_100%,38%_62%,0%_50%,38%_38%)]"
                : "animate-discovery-dot rounded-full",
            )}
          />
        );
      })}
    </span>
  );
}
