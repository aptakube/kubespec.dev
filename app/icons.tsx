// Kubernetes-style wheel, used to mark cluster-scoped kinds
export function KubernetesIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" aria-hidden className={className}>
      <polygon points="10.00,0.70 17.27,4.20 19.07,12.07 14.04,18.38 5.96,18.38 0.93,12.07 2.73,4.20" fill="#326ce5" stroke="#326ce5" strokeWidth="1.2" strokeLinejoin="round" />
      <g fill="none" stroke="white" strokeWidth="0.95" strokeLinecap="round">
        <circle cx="10" cy="10" r="3.9" />
        <path d="M10 10L10.00 3.40 M10 10L15.16 5.88 M10 10L16.43 11.47 M10 10L12.86 15.95 M10 10L7.14 15.95 M10 10L3.57 11.47 M10 10L4.84 5.88" />
      </g>
      <circle cx="10" cy="10" r="1.3" fill="white" />
    </svg>
  );
}
