import React from 'react';
import { Hexagon, Plus } from 'lucide-react';

export default function Logo() {
  return (
    <div className="relative w-10 h-10">
      <Hexagon className="w-10 h-10 text-teal-600 fill-teal-600" />
      <Plus className="absolute inset-0 m-auto w-5 h-5 text-white" />
    </div>
  );
}