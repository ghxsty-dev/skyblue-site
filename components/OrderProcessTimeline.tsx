"use client";

import { useEffect, useRef, useState, type ComponentType, type SVGProps } from "react";
import { useApp } from "@/lib/context";
import {
  CameraIcon,
  CheckIcon,
  MessageIcon,
  PackageIcon,
  PaletteIcon,
  PenToolIcon,
  StarIcon,
} from "@/lib/icons";

type IconComponent = ComponentType<SVGProps<SVGSVGElement> & { size?: number }>;

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export default function OrderProcessTimeline() {
  const { t } = useApp();
  const sectionRef = useRef<HTMLElement>(null);
  const frameRef = useRef<number | null>(null);
  const [progress, setProgress] = useState(0);

  const stages: Array<{
    title: string;
    description: string;
    Icon: IconComponent;
  }> = [
    {
      title: t.orderProcessStageOrderReceived,
      description: t.orderProcessStageOrderReceivedDesc,
      Icon: PackageIcon,
    },
    {
      title: t.orderProcessStageStarted,
      description: t.orderProcessStageStartedDesc,
      Icon: PenToolIcon,
    },
    {
      title: t.orderProcessStageFirstDraft,
      description: t.orderProcessStageFirstDraftDesc,
      Icon: CameraIcon,
    },
    {
      title: t.orderProcessStageRevision,
      description: t.orderProcessStageRevisionDesc,
      Icon: MessageIcon,
    },
    {
      title: t.orderProcessStageRevisionApplied,
      description: t.orderProcessStageRevisionAppliedDesc,
      Icon: PaletteIcon,
    },
    {
      title: t.orderProcessStageApproved,
      description: t.orderProcessStageApprovedDesc,
      Icon: CheckIcon,
    },
    {
      title: t.orderProcessStageReview,
      description: t.orderProcessStageReviewDesc,
      Icon: StarIcon,
    },
  ];

  useEffect(() => {
    const updateProgress = () => {
      frameRef.current = null;
      const section = sectionRef.current;
      if (!section) return;

      const scrollDistance = section.offsetHeight - window.innerHeight;
      const nextProgress = scrollDistance <= 0
        ? 0
        : clamp(-section.getBoundingClientRect().top / scrollDistance, 0, 1);

      setProgress(nextProgress);
    };

    const onScroll = () => {
      if (frameRef.current !== null) return;
      frameRef.current = window.requestAnimationFrame(updateProgress);
    };

    updateProgress();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frameRef.current !== null) window.cancelAnimationFrame(frameRef.current);
    };
  }, []);

  const activeIndex = Math.min(
    stages.length - 1,
    Math.round(progress * (stages.length - 1)),
  );
  const progressPercent = `${progress * 100}%`;

  return (
    <section ref={sectionRef} className="order-process" aria-labelledby="order-process-title">
      <div className="order-process-sticky">
        <div className="order-process-inner page-inner">
          <header className="order-process-heading">
            <p className="order-process-eyebrow">{t.orderProcessEyebrow}</p>
            <h2 id="order-process-title">
              <span className="bg-gradient-to-r from-[#97cdf2] to-[#59abfe] bg-clip-text text-transparent">
                {t.orderProcessTitle}
              </span>
            </h2>
            <p>{t.orderProcessDesc}</p>
          </header>

          <div className="order-process-desktop">
            <div className="order-process-track" style={{ "--order-progress": progressPercent } as React.CSSProperties}>
              <div className="order-process-line" />
              <div className="order-process-line-progress" />
              <ol className="order-process-stages">
                {stages.map((stage, index) => {
                  const Icon = stage.Icon;
                  const state = index < activeIndex ? "complete" : index === activeIndex ? "active" : "pending";

                  return (
                    <li
                      key={stage.title}
                      className={`order-process-stage ${state}`}
                      aria-current={index === activeIndex ? "step" : undefined}
                    >
                      <div className="order-process-marker">
                        <Icon size={18} />
                      </div>
                      <span className="order-process-stage-number">{String(index + 1).padStart(2, "0")}</span>
                      <h3>{stage.title}</h3>
                    </li>
                  );
                })}
              </ol>
            </div>

            <div className="order-process-active-detail">
              <span>{String(activeIndex + 1).padStart(2, "0")} / {String(stages.length).padStart(2, "0")}</span>
              <h3>{stages[activeIndex].title}</h3>
              <p>{stages[activeIndex].description}</p>
            </div>
          </div>

          <ol className="order-process-mobile">
            {stages.map((stage, index) => {
              const Icon = stage.Icon;

              return (
                <li key={stage.title} className="order-process-mobile-stage">
                  <div className="order-process-mobile-marker">
                    <Icon size={18} />
                  </div>
                  <div>
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <h3>{stage.title}</h3>
                    <p>{stage.description}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
