import Link from "next/link";
import React from "react";
import Image from "next/image";

const SparkOpsTestimonial = () => {
  return (
    <div className="bg-white py-16 sm:py-24">
      <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="relative overflow-hidden bg-gray-900 px-6 py-20 shadow-xl sm:rounded-3xl sm:px-10 sm:py-24 md:px-12 lg:px-20">
          <div className="absolute inset-0 bg-gray-900/90 mix-blend-multiply" />
          <div className="absolute -left-80 -top-56 transform-gpu blur-3xl" aria-hidden="true">
            <div
              className="aspect-[1097/845] w-[68.5625rem] bg-gradient-to-r from-[#ff4694] to-[#776fff] opacity-[0.45]"
              style={{
                clipPath:
                  'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
              }}
            />
          </div>
          <div
            className="hidden md:absolute md:bottom-16 md:left-[50rem] md:block md:transform-gpu md:blur-3xl"
            aria-hidden="true"
          >
            <div
              className="aspect-[1097/845] w-[68.5625rem] bg-gradient-to-r from-[#ff4694] to-[#776fff] opacity-25"
              style={{
                clipPath:
                  'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
              }}
            />
          </div>
          <div className="relative w-full lg:mx-0">
            <a target="_blank" href="https://www.sparkops.dev/">
              <Image
                className="h-12 w-auto"
                src="/logos/sparkops-logo.svg" 
                alt=""
                width="12"
                height="12"
              />
            </a>
            <figure>
              <blockquote className="mt-6 text-lg text-white sm:text-xl sm:leading-8">
                <p>
                  “We&apos;ve been using Ubertalent for our freelancer needs at Sparkops, and it&apos;s been nothing short of fantastic. The platform is intuitive, making it easy for us to find talented professionals who perfectly match our project requirements. The quality of work we&apos;ve received has consistently exceeded our expectations, and the support from the Ubertalent team has been exceptional.”
                </p>
              </blockquote>
              <figcaption className="mt-6 text-base text-white">
                <div className="mt-1"><em>CEO of SparkOps</em></div>
              </figcaption>
            </figure>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SparkOpsTestimonial;
