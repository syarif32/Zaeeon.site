
"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useLocale, useTranslations } from "next-intl";
import {
  HiOutlineArrowUpRight,
  HiOutlineCheckCircle,
  HiOutlineExclamationCircle,
} from "react-icons/hi2";

import InputField from "@/common/components/elements/InputField";

interface FormEmail {
  name: string;
  email: string;
  message: string;
}

type FormStatus = "idle" | "success" | "error";

const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ContactForm() {
  const t = useTranslations("ContactPage");
  const locale = useLocale();
  const isId = locale === "id";

  const [status, setStatus] = useState<FormStatus>("idle");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormEmail>();

  useEffect(() => {
    if (status === "idle") return;

    const timeout = window.setTimeout(() => {
      setStatus("idle");
    }, 6000);

    return () => window.clearTimeout(timeout);
  }, [status]);

  const handleFormSubmit = async (payload: FormEmail) => {
    setStatus("idle");

    try {
      await axios.post("/api/email", payload);

      reset();
      setStatus("success");
    } catch (error) {
      console.error("Gagal mengirim pesan:", error);
      setStatus("error");
    }
  };

  return (
    <section className="min-w-0 rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900/40 sm:p-6">
      {/* heading */}
      <div className="mb-6 space-y-1.5">
        <h2 className="text-base font-semibold tracking-tight text-neutral-900 dark:text-neutral-100 sm:text-lg">
          {t("form.title")}
        </h2>

        <p className="text-xs leading-relaxed text-neutral-500 dark:text-neutral-400 sm:text-sm">
          {isId
            ? "Punya pertanyaan atau ingin berkolaborasi? Tinggalkan pesan di sini."
            : "Have a question or want to collaborate? Leave a message here."}
        </p>
      </div>

      {/* form */}
      <form
        onSubmit={handleSubmit(handleFormSubmit)}
        noValidate
        aria-busy={isSubmitting}
        className="min-w-0 space-y-4"
      >
        {/* nama dan email */}
        <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="min-w-0">
            <InputField
              name="name"
              rule={{ required: true }}
              register={register}
              error={errors}
            />
          </div>

          <div className="min-w-0">
            <InputField
              name="email"
              rule={{
                required: true,
                pattern: {
                  value: regexEmail,
                  message: isId
                    ? "Masukkan email yang valid"
                    : "Please enter a valid email",
                },
              }}
              register={register}
              error={errors}
            />
          </div>
        </div>

        {/* pesan */}
        <div className="min-w-0">
          <InputField
            name="message"
            rule={{ required: true }}
            register={register}
            error={errors}
            isTextArea
          />
        </div>

        {/* status pengiriman */}
        {status === "success" && (
          <div
            role="status"
            aria-live="polite"
            className="flex items-start gap-2 rounded-lg bg-emerald-50 px-3 py-2.5 text-xs leading-relaxed text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
          >
            <HiOutlineCheckCircle
              size={17}
              className="shrink-0"
            />
            <span>
              {isId
                ? "Pesan berhasil dikirim. Terima kasih sudah menghubungi saya!"
                : "Your message has been sent. Thanks for reaching out!"}
            </span>
          </div>
        )}

        {status === "error" && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-xs leading-relaxed text-red-700 dark:bg-red-950/30 dark:text-red-400"
          >
            <HiOutlineExclamationCircle
              size={17}
              className="shrink-0"
            />
            <span>
              {isId
                ? "Pesan belum berhasil dikirim. Silakan coba lagi."
                : "Your message couldn't be sent. Please try again."}
            </span>
          </div>
        )}

        {/* tombol */}
        <div className="pt-1">
          <button
            type="submit"
            disabled={isSubmitting}
            className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-neutral-900 px-5 py-3 text-sm font-medium text-white transition-colors duration-200 hover:bg-teal-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-teal-200 sm:w-auto sm:py-2.5"
          >
            {isSubmitting ? (
              <>
                <span
                  aria-hidden="true"
                  className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent"
                />
                <span>
                  {isId ? "Mengirim..." : "Sending..."}
                </span>
              </>
            ) : (
              <>
                <span>
                  {isId ? "Kirim Pesan" : "Send Message"}
                </span>
                <HiOutlineArrowUpRight
                  size={17}
                  className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </>
            )}
          </button>
        </div>
      </form>
    </section>
  );
}
