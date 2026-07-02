type RestaurantIconProps = {
  className?: string;
};

export function RestaurantIcon({ className }: RestaurantIconProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    >
      <path d="M4 3v8" />
      <path d="M8 3v8" />
      <path d="M4 7h4" />
      <path d="M6 11v10" />
      <path d="M17 3c1.7 1.5 2.5 3.4 2.5 5.8 0 2.2-.8 3.9-2.5 5.2v7" />
    </svg>
  );
}
