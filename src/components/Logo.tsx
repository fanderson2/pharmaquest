import React from 'react';
import { Hexagon, Plus } from 'lucide-react';

export default function Logo() {
  return (
    <div className="relative w-7 h-7 sm:w-10 sm:h-10 shrink-0">
      <Hexagon className="w-full h-full text-teal-600 fill-teal-600" />
      <Plus className="absolute inset-0 m-auto w-3.5 h-3.5 sm:w-5 sm:h-5 text-white" />
    </div>
  );
}
