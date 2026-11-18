import gsap from "gsap";

export function useGsap3D() {
  const onCardMouseMove = (event, maxTilt = 9) => {
    const el = event.currentTarget;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const percentX = (x - centerX) / centerX;
    const percentY = (y - centerY) / centerY;

    const rotateX = -percentY * maxTilt;
    const rotateY = percentX * maxTilt;

    el.style.setProperty("--glare-x", `${(x / rect.width) * 100}%`);
    el.style.setProperty("--glare-y", `${(y / rect.height) * 100}%`);
    el.style.setProperty("--glare-opacity", "1");

    gsap.to(el, {
      rotateX,
      rotateY,
      transformPerspective: 1100,
      duration: 0.35,
      ease: "power2.out",
      overwrite: "auto",
    });
  };

  const onCardMouseLeave = (event) => {
    const el = event.currentTarget;
    if (!el) return;
    el.style.setProperty("--glare-opacity", "0");
    gsap.to(el, {
      rotateX: 0,
      rotateY: 0,
      transformPerspective: 1100,
      duration: 0.55,
      ease: "power3.out",
      overwrite: "auto",
      clearProps: "transform",
    });
  };

  const onMagneticMove = (event, strength = 0.28) => {
    const el = event.currentTarget;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const dx = event.clientX - (rect.left + rect.width / 2);
    const dy = event.clientY - (rect.top + rect.height / 2);
    gsap.to(el, {
      x: dx * strength,
      y: dy * strength,
      scale: 1.08,
      duration: 0.25,
      ease: "power2.out",
      overwrite: "auto",
    });
  };

  const onMagneticLeave = (event) => {
    const el = event.currentTarget;
    if (!el) return;
    gsap.to(el, {
      x: 0,
      y: 0,
      scale: 1,
      duration: 0.6,
      ease: "elastic.out(1, 0.45)",
      overwrite: "auto",
      clearProps: "transform",
    });
  };

  const animateStaggerReveal = (containerEl, itemSelector = ".gsap-reveal") => {
    if (!containerEl) return;
    const items = containerEl.querySelectorAll(itemSelector);
    if (!items.length) return;
    gsap.killTweensOf(items);
    gsap.fromTo(
      items,
      {
        opacity: 0,
        y: 22,
        scale: 0.985,
      },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.55,
        stagger: 0.055,
        ease: "power3.out",
        clearProps: "transform,opacity",
      }
    );
  };

  const animateCounter = (targetRef, finalValue, duration = 1.8) => {
    const obj = { val: 0 };
    gsap.to(obj, {
      val: finalValue,
      duration,
      ease: "power3.out",
      onUpdate: () => {
        targetRef.value = Math.round(obj.val);
      },
    });
  };

  return {
    onCardMouseMove,
    onCardMouseLeave,
    onMagneticMove,
    onMagneticLeave,
    animateStaggerReveal,
    animateCounter,
  };
}
