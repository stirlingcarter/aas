interface CloudProps {
  className?: string;
  opacity?: number;
}

function CloudShape1({ className = '', opacity = 0.07 }: CloudProps) {
  return (
    <svg viewBox="0 0 800 400" className={className} style={{ opacity }} fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M720 280c0-44.2-35.8-80-80-80-8.8 0-17.4 1.4-25.4 4.2C600.6 156.2 556.2 120 503 120c-35.6 0-67.2 17.4-86.8 44.2C402 148.8 380 140 356 140c-55.2 0-100 44.8-100 100 0 4.6.4 9 1 13.4C230.8 260 210 284.6 210 314c0 41.2 33.4 74.6 74.6 74.6h370.8c36.4 0 64.6-28.2 64.6-64.6 0-18-7.4-34.2-19.2-45.8 12.2-10.8 19.2-26 19.2-42.2zM160 320c0-33-20.4-61.2-49.2-73C108 236 100 224 100 210c0-22 18-40 40-40 6 0 11.6 1.2 16.8 3.6C168 134 207 104 253 104c28 0 53 12.8 69.6 33" />
    </svg>
  );
}

function CloudShape2({ className = '', opacity = 0.05 }: CloudProps) {
  return (
    <svg viewBox="0 0 900 350" className={className} style={{ opacity }} fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M780 230c0-55-45-100-100-100-11 0-21.6 1.8-31.6 5C632 88 582 54 524 54c-44.4 0-84 21.8-108.2 55.2C398.8 90.2 374 78 346 78c-57.6 0-104.4 46.8-104.4 104.4 0 2.2.2 4.4.2 6.6C212 196 190 218 178 246c-8-3.4-16.6-5.4-25.8-5.4C114.8 240.6 84 271.4 84 308.8s30.8 68.2 68.2 68.2h564.2c42.8 0 77.6-34.8 77.6-77.6 0-28.6-15.4-53.4-38.4-66.8 15.8-14.6 24.4-35 24.4-58.6z" />
    </svg>
  );
}

function CloudShape3({ className = '', opacity = 0.04 }: CloudProps) {
  return (
    <svg viewBox="0 0 1000 300" className={className} style={{ opacity }} fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M850 200c0-38.6-27.4-71-63.8-78.4C776.8 78 738 44 691 44c-30 0-57 14.2-74.2 36.4C600 62 573 52 544 52c-50 0-92 34.8-103 81.6C422.6 118 396.2 108 368 108c-60 0-108.6 48.6-108.6 108.6 0 3.2.2 6.2.4 9.2-18.4 8.8-32.4 25.6-37 46.2h-60.6c-24.8 0-45-20.2-45-45s20.2-45 45-45c2 0 3.8.2 5.8.4-2.4-8.6-3.8-17.8-3.8-27.2 0-55.2 44.8-100 100-100 20.4 0 39.4 6.2 55.2 16.6C340 38 381.6 14 429 14c48 0 89.8 28.2 109 69C555 64.8 579 54 605 54c46 0 85.2 29.4 100 70.4C718 100.6 742 86 769 86c49.8 0 90 40.2 90 90 0 8.4-1.2 16.6-3.4 24.4" />
    </svg>
  );
}

export function CloudLayer() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
      {/* Large background clouds */}
      <CloudShape1
        className="absolute w-[800px] text-white cloud-drift-a"
        opacity={0.06}
      />
      <CloudShape2
        className="absolute w-[900px] text-white cloud-drift-b"
        opacity={0.04}
      />
      <CloudShape3
        className="absolute w-[1000px] text-white cloud-drift-c"
        opacity={0.05}
      />

      {/* Smaller accent clouds */}
      <CloudShape1
        className="absolute w-[500px] text-white cloud-drift-d"
        opacity={0.03}
      />
      <CloudShape2
        className="absolute w-[600px] text-white cloud-drift-e"
        opacity={0.035}
      />
    </div>
  );
}
