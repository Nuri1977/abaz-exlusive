import React from "react";
import Image from "next/image";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const AboutPage = () => {
  return (
    <main className="mx-auto max-w-7xl space-y-20 px-4 py-12 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <section className="space-y-4 text-center">
        <h1 className="text-3xl font-semibold text-gray-900 sm:text-4xl">
          About Shalom Radio
        </h1>
        <p className="text-lg text-gray-600">
          A Christian-based national and online radio station—connecting Sierra
          Leone and the world through faith, community, and quality
          broadcasting.
        </p>
      </section>

      {/* Mission */}
      <section className="space-y-4 rounded-xl bg-white p-8 shadow">
        <h2 className="text-2xl font-semibold text-gray-900">Our Mission</h2>
        <p className="leading-relaxed text-gray-700">
          To be the spiritual and informative voice of Sierra Leone, rooted in
          Christian values. We aim to enrich lives with content that informs,
          inspires, and unites communities—from Kabala to the rest of the nation
          and beyond through online access.
        </p>
      </section>

      {/* Our Story */}
      <section className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
        <div className="relative h-72 w-full overflow-hidden rounded-lg shadow sm:h-96">
          <Image
            src="https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=1469&q=80"
            alt="Shalom Radio History"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-primary opacity-20"></div>
        </div>
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-900">Our Story</h2>
          <p className="text-gray-700">
            Established in 2010, Shalom Radio began in Kabala with a Christian
            mission to uplift, educate, and inform. We've since grown into a
            nationwide voice, expanding to Mongo Bendugu and reaching global
            audiences via our online platforms.
          </p>
          <p className="text-gray-700">
            Tune in on <strong>89.5 FM (Kabala)</strong> or{" "}
            <strong>93.3 FM (Mongo Bendugu)</strong>. You can also listen from
            anywhere in the world via our online stream and mobile app.
          </p>

          <Accordion type="single" collapsible>
            <AccordionItem value="values">
              <AccordionTrigger className="text-base font-medium">
                Our Core Values
              </AccordionTrigger>
              <AccordionContent>
                <ul className="list-disc space-y-1 pl-5 text-sm text-gray-700">
                  <li>Faith-centered broadcasting</li>
                  <li>Integrity and transparency</li>
                  <li>Community service and upliftment</li>
                  <li>Accessible communication for all</li>
                  <li>Technological innovation</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="community">
              <AccordionTrigger className="text-base font-medium">
                Nationwide Community Engagement
              </AccordionTrigger>
              <AccordionContent>
                <p className="text-sm text-gray-700">
                  We work with churches, civic groups, and leaders across Sierra
                  Leone to support growth, education, and spiritual life across
                  the country.
                </p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="broadcast">
              <AccordionTrigger className="text-base font-medium">
                Broadcast Commitment
              </AccordionTrigger>
              <AccordionContent>
                <p className="text-sm text-gray-700">
                  From audio quality to program relevance, we aim to deliver
                  excellence to every listener—on FM or online.
                </p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* Programming Philosophy */}
      <section className="space-y-6 rounded-xl bg-gray-100 p-8 shadow">
        <h2 className="text-2xl font-semibold text-gray-900">
          Programming Philosophy
        </h2>
        <p className="text-gray-700">
          Our content is faith-driven and community-focused:
        </p>
        <ul className="list-disc space-y-2 pl-5 text-gray-700">
          <li>
            <strong>Gospel Teachings:</strong> Scripture readings, devotionals,
            and spiritual reflections
          </li>
          <li>
            <strong>News:</strong> Christian perspective on local and global
            news
          </li>
          <li>
            <strong>Music:</strong> Gospel, worship, and uplifting music from
            around the world
          </li>
          <li>
            <strong>Talk Shows:</strong> Real conversations on faith, family,
            and society
          </li>
          <li>
            <strong>Youth & Education:</strong> Programs that empower the next
            generation
          </li>
        </ul>
      </section>

      {/* Reach & Coverage */}
      <section className="space-y-4 rounded-xl bg-white p-8 shadow">
        <h2 className="text-2xl font-semibold text-gray-900">
          Reach and Coverage
        </h2>
        <p className="leading-relaxed text-gray-700">
          Shalom Radio broadcasts on <strong>89.5 FM in Kabala</strong> and{" "}
          <strong>93.3 FM in Mongo Bendugu</strong>, reaching thousands locally.
          Our online stream and mobile app expand that reach to the entire
          country and the diaspora, connecting listeners through the power of
          technology and faith.
        </p>
      </section>

      {/* Staff Section */}
      <section className="space-y-6 rounded-xl bg-gray-100 p-8 shadow">
        <h2 className="text-2xl font-semibold text-gray-900">Our Team</h2>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {/* Saffie Kamara */}
          <div className="text-center">
            <div className="relative mx-auto mb-4 size-32 overflow-hidden rounded-full">
              <Image
                fill
                className="object-cover"
                src="https://randomuser.me/api/portraits/women/60.jpg"
                alt="Saffie Kamara"
              />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Saffie Kamara
            </h3>
            <p className="text-primary">Station Manager, Kabala</p>
            <p className="mt-2 text-sm text-gray-600">
              Leads daily operations at Shalom Radio 89.5 FM.
            </p>
          </div>

          {/* Mamoud Marah */}
          <div className="text-center">
            <div className="relative mx-auto mb-4 size-32 overflow-hidden rounded-full">
              <Image
                fill
                className="object-cover"
                src="https://randomuser.me/api/portraits/men/45.jpg"
                alt="Mamoud Marah"
              />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Mamoud Marah
            </h3>
            <p className="text-primary">Chief Executive Officer</p>
            <p className="mt-2 text-sm text-gray-600">
              Provides vision and strategic leadership for the entire Shalom
              Radio network.
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="text-center">
        <p className="text-lg font-medium text-gray-700">
          Join us on 89.5 FM, 93.3 FM, or online — and let your faith be heard!
        </p>
      </section>
    </main>
  );
};

export default AboutPage;
