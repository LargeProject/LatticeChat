const Label = () => {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      <div className="relative max-w-md space-y-4 rounded-xl border border-zinc-800 bg-black/90 backdrop-blur-1xl p-6 text-center shadow-[0_20px_80px_rgba(0,0,0,0.45)] z-30">
        <h1 className="text-5xl font-extrabold tracking-tight bg-linear-to-r from-cyan-400 via-purple-400 to-blue-500 bg-clip-text text-transparent bg-size-[200%_200%] animate-gradient">
          Lattice Chat
        </h1>

        <p className="text-zinc-400 text-base leading-relaxed">
          End-to-end encrypted messaging powered by
          <span className="text-zinc-200 font-semibold"> post-quantum cryptography</span>.{' '}
          <span className="text-yellow-200 font-semibold">
            In progress demo project-use at your own risk. We cannot guarantee protection against sophisticated attacks.
          </span>
        </p>

        <p className="text-black-500 text-sm leading-relaxed">
          Key exchange uses the
          <span className="text-purple-400 font-semibold"> Kyber lattice algorithm</span>, designed to remain secure
          even against future quantum computers.
        </p>

        <div className="flex gap-4 justify-center pt-2 text-[12px] font-mono text-black-500">
          <span className="border border-zinc-800 px-2 py-1 rounded">E2EE</span>
          <span className="border border-zinc-800 px-2 py-1 rounded">Post-Quantum</span>
          <span className="border border-zinc-800 px-2 py-1 rounded">Kyber KEM</span>
        </div>
      </div>
    </div>
  );
};

export default Label;
