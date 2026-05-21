export interface ObserveOptions {
  once?: boolean;
  threshold?: number;
  className?: string;
}

export function observeVisibility(
  selector: string,
  options: ObserveOptions = {}
): IntersectionObserver {
  const {
    once = true,
    threshold = 0.2,
    className = 'is-visible',
  } = options;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add(className);
          if (once) observer.unobserve(entry.target);
        } else if (!once) {
          entry.target.classList.remove(className);
        }
      });
    },
    { threshold }
  );

  document.querySelectorAll(selector).forEach((el) => observer.observe(el));
  return observer;
}
