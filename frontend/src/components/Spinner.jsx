import React from 'react';

const Spinner = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#EAF6F9] dark:bg-stone-950">
      <div className="text-center">
        <div className="relative inline-flex items-center justify-center">
          <div className="h-14 w-14 rounded-full border-4 border-[#77BEE0]/40 border-t-[#0574EE] animate-spin"></div>
          <div className="absolute h-6 w-6 rounded-full bg-gradient-to-tr from-[#77BEE0] to-[#0574EE] animate-pulse"></div>
        </div>
        <p className="mt-4 text-[#155AA4] dark:text-stone-200 font-semibold">Loading...</p>
        <p className="text-[11px] text-[#155AA4]/80 dark:text-stone-400 mt-1">Connecting you to What's Next</p>
      </div>
    </div>
  );
};

export default Spinner;
