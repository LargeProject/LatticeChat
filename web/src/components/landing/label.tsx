const Label = () => {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      <div className="relative max-w-md space-y-4 rounded-xl border border-zinc-800 bg-black/90 backdrop-blur-1xl p-6 text-center shadow-[0_20px_80px_rgba(0,0,0,0.45)] z-30">
        <h1 className="text-6xl font-extrabold tracking-tight bg-linear-to-r from-cyan-400 via-purple-400 to-blue-500 bg-clip-text text-transparent bg-size-[200%_200%] animate-gradient">
          Lattice Chat
        </h1>

        <div className="flex gap-4 justify-center pt-2 text-[14px] font-mono text-black-500">
          <span className="border border-zinc-800 px-2 py-1 rounded">Encrypted during transit</span>
        </div>
      </div>
    </div>
  );
};

export default Label;
