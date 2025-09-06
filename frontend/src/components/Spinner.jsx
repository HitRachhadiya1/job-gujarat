import React from 'react';

const Spinner = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-300 dark:bg-stone-950 transition-colors duration-500">
      <div className="text-center">
        <div
          className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-stone-400 border-t-stone-700 dark:border-stone-600 dark:border-t-stone-200 mb-4"
          aria-label="Loading"
          role="status"
        ></div>
        <p className="text-stone-700 dark:text-stone-300 font-medium">Loading...</p>
      </div>
    </div>
  );
};

export default Spinner;
