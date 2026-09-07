"use client";

import Image from "next/image";
import { AnimatePresence, motion, useInView } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useApp } from "@/lib/context";
import { CheckIcon, PackageIcon, StarIcon } from "@/lib/icons";

const SCROLL_LAYOUT = "(min-width: 900px) and (min-height: 720px) and (prefers-reduced-motion: no-preference)";
const STAGE_COUNT = 4;

interface ProcessMessage {
  from: "customer" | "team";
  text: string;
  attachment?: "draft" | "final";
  file?: boolean;
  review?: boolean;
}

export default function OrderProcessTimeline() {
  const { t, lang } = useApp();
  const sectionRef = useRef<HTMLElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduceMotion(media.matches);
    const frame = window.requestAnimationFrame(update);
    media.addEventListener("change", update);
    return () => {
      window.cancelAnimationFrame(frame);
      media.removeEventListener("change", update);
    };
  }, []);

  const stages: {
    id: string;
    label: string;
    title: string;
    description: string;
    status: string;
    messages: ProcessMessage[];
  }[] = [
    {
      id: "order",
      label: t.orderProcessOrderLabel,
      title: t.orderProcessOrderTitle,
      description: t.orderProcessOrderDesc,
      status: t.orderProcessOrderStatus,
      messages: [
        { from: "customer", text: t.orderProcessMessageRequest },
        { from: "team", text: t.orderProcessMessageReceived },
        { from: "team", text: t.orderProcessMessageStarted },
      ],
    },
    {
      id: "draft",
      label: t.orderProcessDraftLabel,
      title: t.orderProcessDraftTitle,
      description: t.orderProcessDraftDesc,
      status: t.orderProcessDraftStatus,
      messages: [
        { from: "team", text: t.orderProcessMessageDraft, attachment: "draft" },
        { from: "team", text: t.orderProcessMessageOffer },
      ],
    },
    {
      id: "revision",
      label: t.orderProcessRevisionLabel,
      title: t.orderProcessRevisionTitle,
      description: t.orderProcessRevisionDesc,
      status: t.orderProcessRevisionStatus,
      messages: [
        { from: "customer", text: t.orderProcessMessageRevision },
        { from: "team", text: t.orderProcessMessageUpdated, attachment: "final" },
      ],
    },
    {
      id: "delivery",
      label: t.orderProcessDeliveryLabel,
      title: t.orderProcessDeliveryTitle,
      description: t.orderProcessDeliveryDesc,
      status: t.orderProcessDeliveryStatus,
      messages: [
        { from: "customer", text: t.orderProcessMessageApproved },
        { from: "team", text: t.orderProcessMessageDelivered, file: true },
        { from: "customer", text: t.orderProcessMessageReview, review: true },
      ],
    },
  ];

  useEffect(() => {
    const media = window.matchMedia(SCROLL_LAYOUT);
    let frame: number | null = null;

    const update = () => {
      frame = null;
      const section = sectionRef.current;
      const sticky = stickyRef.current;
      if (!media.matches || !section || !sticky) return;

      // Measure the actual sticky travel, including the fixed navigation offset.
      const distance = section.offsetHeight - sticky.offsetHeight;
      const top = parseFloat(getComputedStyle(sticky).top);
      const progress = Math.max(0, Math.min(1, (top - section.getBoundingClientRect().top) / Math.max(1, distance)));
      setActiveIndex(Math.min(STAGE_COUNT - 1, Math.floor(progress * STAGE_COUNT)));
    };

    const schedule = () => {
      if (frame === null) frame = window.requestAnimationFrame(update);
    };

    const observer = new ResizeObserver(schedule);
    if (sectionRef.current) observer.observe(sectionRef.current);
    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    media.addEventListener("change", schedule);
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      media.removeEventListener("change", schedule);
      if (frame !== null) window.cancelAnimationFrame(frame);
    };
  }, []);

  function selectStage(index: number) {
    setActiveIndex(index);
    const section = sectionRef.current;
    const sticky = stickyRef.current;
    if (!window.matchMedia(SCROLL_LAYOUT).matches || !section || !sticky) return;

    const distance = section.offsetHeight - sticky.offsetHeight;
    const top = parseFloat(getComputedStyle(sticky).top);
    window.scrollTo({
      top: window.scrollY + section.getBoundingClientRect().top - top + ((index + 0.1) / STAGE_COUNT) * distance,
      behavior: "instant",
    });
  }

  const stage = stages[activeIndex];

  return (
    <section ref={sectionRef} className="order-process" aria-labelledby="order-process-title" data-stage={activeIndex}>
      <div ref={stickyRef} className="order-process-sticky">
        <div className="order-process-layout page-inner">
          <div className="order-process-copy">
            <header className="order-process-heading">
              <p className="order-process-eyebrow">{t.orderProcessEyebrow}</p>
              <h2 id="order-process-title">{t.orderProcessTitle}</h2>
              <p>{t.orderProcessDesc}</p>
            </header>

            <div className="order-process-tabs" role="tablist" aria-label={t.orderProcessTitle}>
              {stages.map((item, index) => (
                <button
                  key={item.id}
                  ref={(element) => { tabsRef.current[index] = element; }}
                  type="button"
                  role="tab"
                  id={`order-process-tab-${item.id}`}
                  aria-controls="order-process-conversation"
                  aria-selected={activeIndex === index}
                  tabIndex={activeIndex === index ? 0 : -1}
                  onClick={() => selectStage(index)}
                  onKeyDown={(event) => {
                    let next = index;
                    if (event.key === "ArrowRight" || event.key === "ArrowDown") next = (index + 1) % STAGE_COUNT;
                    else if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = (index + STAGE_COUNT - 1) % STAGE_COUNT;
                    else if (event.key === "Home") next = 0;
                    else if (event.key === "End") next = STAGE_COUNT - 1;
                    else return;
                    event.preventDefault();
                    selectStage(next);
                    tabsRef.current[next]?.focus({ preventScroll: true });
                  }}
                >
                  <span className="order-process-tab-number">0{index + 1}</span>
                  <span>{item.label}</span>
                  <CheckIcon size={16} aria-hidden="true" className={index < activeIndex ? "is-complete" : ""} />
                </button>
              ))}
            </div>

            <div className="order-process-detail">
              <motion.div
                key={`${lang}-${stage.id}`}
                initial={{ opacity: reduceMotion ? 1 : 0, y: reduceMotion ? 0 : 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: reduceMotion ? 0 : 0.25 }}
              >
                <h3>{stage.title}</h3>
                <p>{stage.description}</p>
              </motion.div>
            </div>
          </div>

          <div
            className="order-process-conversation"
            id="order-process-conversation"
            role="tabpanel"
            aria-labelledby={`order-process-tab-${stage.id}`}
          >
            <div className="order-process-channel">
              <span className="order-process-channel-hash" aria-hidden="true">#</span>
              <div>
                <strong>{t.orderProcessChannel}</strong>
                <span>SkyBlue / {t.orderProcessExample}</span>
              </div>
              <span className="order-process-channel-members" aria-hidden="true">
                <Image src="/process-logo-white.webp" width={24} height={24} alt="" />
                <span>{t.orderProcessCustomer.charAt(0)}</span>
              </span>
            </div>

            <div ref={sceneRef} className="order-process-scene" tabIndex={0} role="region" aria-label={t.orderProcessConversation}>
              <AnimatePresence
                mode="wait"
                initial={false}
                onExitComplete={() => sceneRef.current?.scrollTo({ top: 0, behavior: "instant" })}
              >
                <Conversation
                  key={`${lang}-${stage.id}`}
                  messages={stage.messages}
                  status={stage.status}
                  reduceMotion={reduceMotion}
                />
              </AnimatePresence>
            </div>

            <div className="order-process-conversation-footer" aria-hidden="true">
              <span>{t.orderProcessExample}</span>
              <div className="order-process-segments">
                {stages.map((item, index) => <span key={item.id} className={index <= activeIndex ? "is-filled" : ""} />)}
              </div>
              <span>0{activeIndex + 1} / 04</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Conversation({ messages, status, reduceMotion }: { messages: ProcessMessage[]; status: string; reduceMotion: boolean }) {
  const { t } = useApp();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });
  const finishDelay = reduceMotion ? 0 : messages.length * 0.3 + 0.15;

  return (
    <motion.div
      ref={ref}
      className="order-process-conversation-content"
      initial="hidden"
      animate={inView || reduceMotion ? "visible" : "hidden"}
      exit={{ opacity: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.12 }}
    >
      <ol className="order-process-messages">
        {messages.map((message, index) => (
          <motion.li
            key={index}
            className="order-process-message"
            variants={{ hidden: { opacity: reduceMotion ? 1 : 0, y: reduceMotion ? 0 : 12 }, visible: { opacity: 1, y: 0 } }}
            transition={{ duration: reduceMotion ? 0 : 0.3, delay: reduceMotion ? 0 : index * 0.3 + 0.1 }}
          >
            <div className={`order-process-avatar ${message.from}`} aria-hidden="true">
              {message.from === "team" ? <Image src="/process-logo-white.webp" alt="" width={36} height={36} /> : <span>{t.orderProcessCustomer.charAt(0)}</span>}
            </div>
            <div className="order-process-message-body">
              <div className="order-process-message-meta">
                <strong className={message.from}>{message.from === "team" ? "SkyBlue" : t.orderProcessCustomer}</strong>
                {message.from === "team" && <span className="order-process-role">{t.orderProcessDesigner}</span>}
                <span className="order-process-time" aria-hidden="true">14:{20 + index * 2}</span>
              </div>
              <p>{message.text}</p>
              {message.attachment && (
                <figure className={`order-process-attachment ${message.attachment}`}>
                  <div className="order-process-artwork">
                    <Image
                      src={message.attachment === "draft" ? "/process-logo-blue.webp" : "/process-logo-white.webp"}
                      alt={message.attachment === "draft" ? t.orderProcessDraftAlt : t.orderProcessFinalAlt}
                      width={256}
                      height={256}
                      sizes="(max-width: 480px) 80px, 120px"
                    />
                    <span aria-hidden="true">{message.attachment === "draft" ? "01" : "02"}</span>
                  </div>
                  <figcaption><span>skyblue-logo.webp</span><span>{message.attachment === "draft" ? "V1" : "V2"}</span></figcaption>
                </figure>
              )}
              {message.file && (
                <div className="order-process-file">
                  <PackageIcon size={22} aria-hidden="true" />
                  <div><strong>skyblue-logo.webp</strong><span>1024 x 1024 / {t.orderProcessFinalFile}</span></div>
                  <CheckIcon size={18} aria-hidden="true" />
                </div>
              )}
              {message.review && (
                <div className="order-process-rating" role="img" aria-label="5 / 5">
                  {[1, 2, 3, 4, 5].map((star) => <StarIcon key={star} size={14} aria-hidden="true" />)}
                </div>
              )}
            </div>
          </motion.li>
        ))}
      </ol>
      <div className="order-process-activity">
        {!reduceMotion && (
          <motion.span
            className="order-process-typing"
            variants={{ hidden: { opacity: 0 }, visible: { opacity: [1, 1, 0] } }}
            transition={{ duration: finishDelay, times: [0, 0.8, 1] }}
            aria-hidden="true"
          >
            <span className="order-process-typing-dots"><i /><i /><i /></span>
            {t.orderProcessTyping}
          </motion.span>
        )}
        <motion.span
          className="order-process-status"
          variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
          transition={{ duration: reduceMotion ? 0 : 0.2, delay: finishDelay }}
        >
          <CheckIcon size={14} aria-hidden="true" />{status}
        </motion.span>
      </div>
    </motion.div>
  );
}
