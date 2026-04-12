"use client";

import { useState } from "react";
import Link from "next/link";

export default function LegalPage() {
  const [activeTab, setActiveTab] = useState<"privacy" | "terms" | "disclaimer">("privacy");

  return (
    <div className="bg-bg min-h-screen text-text font-body">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_50%_0%,rgba(0,230,118,0.04),transparent_60%)]" />
      </div>

      <nav className="fixed top-0 left-0 right-0 z-50 h-14 px-4 md:px-8 flex items-center justify-between bg-bg/85 backdrop-blur-xl border-b border-white/5">
        <Link href="/" className="text-sm text-text3 flex items-center gap-2 hover:text-text2 transition-colors">
          <i className="fas fa-arrow-left" /> Back to site
        </Link>
        <div className="flex items-center gap-2.5 font-display font-bold text-lg tracking-tight">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
            <i className="fas fa-motorcycle text-black text-xs -rotate-12" />
          </div>
          Ride<span className="text-accent">Share</span>
        </div>
      </nav>

      <div className="sticky top-14 z-40 bg-bg/90 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-4xl mx-auto px-4 md:px-8 flex gap-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab("privacy")}
            className={`px-6 py-3.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === "privacy"
                ? "text-accent border-accent font-semibold"
                : "text-text3 border-transparent hover:text-text2"
            }`}
          >
            Privacy Policy
          </button>
          <button
            onClick={() => setActiveTab("terms")}
            className={`px-6 py-3.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === "terms"
                ? "text-accent border-accent font-semibold"
                : "text-text3 border-transparent hover:text-text2"
            }`}
          >
            Terms of Service
          </button>
          <button
            onClick={() => setActiveTab("disclaimer")}
            className={`px-6 py-3.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === "disclaimer"
                ? "text-accent border-accent font-semibold"
                : "text-text3 border-transparent hover:text-text2"
            }`}
          >
            Liability Disclaimer
          </button>
        </div>
      </div>

      <main className="relative z-10 max-w-3xl mx-auto px-4 md:px-8 py-12 md:py-16">
        {activeTab === "privacy" && <PrivacyPolicy />}
        {activeTab === "terms" && <TermsOfService />}
        {activeTab === "disclaimer" && <LiabilityDisclaimer />}
      </main>

      <footer className="relative z-10 text-center text-xs text-text4 py-10 border-t border-border">
        <p>These documents apply to all users of RideShare.</p>
        <p className="mt-2">RideShare · Mbarara, Uganda</p>
      </footer>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="font-display text-xl md:text-2xl font-bold mt-10 mb-3 tracking-tight">{children}</h2>;
}

function SubTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="font-display text-base font-semibold mt-6 mb-2">{children}</h3>;
}

function Paragraph({ children }: { children: React.ReactNode }) {
  return <p className="text-sm md:text-base text-text2 leading-relaxed mb-4">{children}</p>;
}

function ListItem({ children }: { children: React.ReactNode }) {
  return <li className="text-sm md:text-base text-text2 leading-relaxed mb-2">{children}</li>;
}

function InfoBox({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card border border-accent/20 rounded-xl p-5 my-6">
      <div className="flex items-center gap-2 text-accent font-semibold text-sm mb-2">
        <i className="fas fa-shield-halved" /> {title}
      </div>
      <p className="text-sm text-text2 leading-relaxed">{children}</p>
    </div>
  );
}

function WarningBox({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-red/5 border border-red/20 rounded-xl p-5 my-6">
      <div className="flex items-center gap-2 text-red font-semibold text-sm mb-2">
        <i className="fas fa-triangle-exclamation" /> {title}
      </div>
      <p className="text-sm text-text2 leading-relaxed">{children}</p>
    </div>
  );
}

function PrivacyPolicy() {
  return (
    <div>
      <div className="text-center mb-10 pb-8 border-b border-border">
        <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight mb-2">Privacy Policy</h1>
        <p className="text-sm text-text3">Last updated: January 2025 · Version 1.0</p>
      </div>

      <InfoBox title="Our approach to privacy">
        We deliberately designed RideShare to collect the minimum data necessary to function. We do not collect phone numbers, physical location data, or payment information. Our philosophy is: if we don&apos;t need it to make the app work, we don&apos;t collect it.
      </InfoBox>

      <SectionTitle>1. Introduction</SectionTitle>
      <Paragraph>
        RideShare (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;the platform&rdquo;) is a ride-matching application designed for university students in Uganda. This Privacy Policy explains what personal data we collect, how we use it, who has access to it, and what rights you have over it.
      </Paragraph>
      <Paragraph>
        By creating an account or using RideShare, you acknowledge that you have read and understood this Privacy Policy. If you do not agree with any part of this policy, you should not use the platform.
      </Paragraph>

      <SectionTitle>2. Information We Collect</SectionTitle>
      <SubTitle>2.1 Information You Provide Directly</SubTitle>
      <ul className="list-disc pl-5 space-y-2">
        <ListItem><strong>Full name</strong> — Display name on your profile and ride cards</ListItem>
        <ListItem><strong>Email address</strong> — Used for account creation, verification, and launch notifications</ListItem>
        <ListItem><strong>Password</strong> — Hashed using bcrypt. We never see or store your plaintext password</ListItem>
        <ListItem><strong>Gender</strong> — Used for same-gender ride preference matching</ListItem>
        <ListItem><strong>University</strong> — The campus you belong to. Determines which rides appear in your feed</ListItem>
        <ListItem><strong>Hostel or area</strong> — Optional. Helps other riders understand your general location</ListItem>
      </ul>

      <SubTitle>2.2 Information Generated Through Use</SubTitle>
      <ul className="list-disc pl-5 space-y-2">
        <ListItem><strong>Trust score</strong> — Calculated as a rolling average of ratings you receive</ListItem>
        <ListItem><strong>Ride history</strong> — Every ride you post, join, complete, or cancel</ListItem>
        <ListItem><strong>Ratings received</strong> — Star ratings and optional comments from other users</ListItem>
        <ListItem><strong>Safety PINs</strong> — Generated per ride per participant</ListItem>
        <ListItem><strong>Chat messages</strong> — Temporary messages that expire after the chat expiry time</ListItem>
      </ul>

      <SectionTitle>What We Do Not Collect</SectionTitle>
      <InfoBox title="Deliberately excluded">
        The following categories of data are intentionally not collected by RideShare because they are either unnecessary for our service or present an unacceptable privacy risk.
      </InfoBox>
      <ul className="list-disc pl-5 space-y-2">
        <ListItem><strong>Phone numbers</strong> — All communication happens through in-app chat</ListItem>
        <ListItem><strong>Physical location / GPS data</strong> — We do not track your real-time location</ListItem>
        <ListItem><strong>Payment information</strong> — We never handle money</ListItem>
        <ListItem><strong>Photos or biometric data</strong> — We do not require profile photos</ListItem>
        <ListItem><strong>Device identifiers for advertising</strong> — We do not use any advertising SDKs</ListItem>
      </ul>

      <SectionTitle>3. How We Use Your Information</SectionTitle>
      <ul className="list-disc pl-5 space-y-2">
        <ListItem><strong>Account creation and verification</strong> — Your email and name create and verify your account</ListItem>
        <ListItem><strong>Ride matching</strong> — Your university determines which rides appear in your feed</ListItem>
        <ListItem><strong>Trust scoring</strong> — Ratings are aggregated into a public trust score</ListItem>
        <ListItem><strong>Communication</strong> — Your name and trust score are visible to ride participants</ListItem>
        <ListItem><strong>Safety verification</strong> — Safety PINs are generated for identity verification</ListItem>
      </ul>

      <SectionTitle>4. How Your Information Is Stored</SectionTitle>
      <Paragraph>All data is stored in a PostgreSQL database hosted on Supabase. Passwords are stored as bcrypt hashes, session tokens use SHA-256 hashing, and all tables have Row Level Security (RLS) enabled.</Paragraph>

      <SectionTitle>5. Information Sharing</SectionTitle>
      <Paragraph>We do not sell, rent, trade, or otherwise monetize your personal data. We share information only with ride participants (name, trust score, verification status), with rated users, and for legal compliance when required by Ugandan law.</Paragraph>

      <SectionTitle>6. Data Retention</SectionTitle>
      <ul className="list-disc pl-5 space-y-2">
        <ListItem><strong>Ride history</strong> — Permanently stored for safety and accountability</ListItem>
        <ListItem><strong>Chat messages</strong> — Accessible only while the chat is active, then inaccessible</ListItem>
        <ListItem><strong>OTP codes</strong> — Deleted within 24 hours of expiry</ListItem>
        <ListItem><strong>Account data</strong> — Permanently removed within 30 days of account deletion</ListItem>
      </ul>

      <SectionTitle>7. Your Rights</SectionTitle>
      <Paragraph>Under the Uganda Data Protection Act 2019, you have the right to access, rectification, erasure, restrict processing, data portability, withdraw consent, and lodge a complaint. Contact us at privacy@rideshare.ug to exercise these rights.</Paragraph>

      <SectionTitle>8. Data Security</SectionTitle>
      <Paragraph>All data in transit is encrypted using TLS. Passwords are hashed with bcrypt. Row Level Security (RLS) is enabled on every database table. We do not use any third-party analytics, advertising, or tracking SDKs.</Paragraph>

      <SectionTitle>9. Age and Eligibility</SectionTitle>
      <Paragraph>RideShare is intended for university students aged 18 and above. We do not knowingly collect data from persons under 18.</Paragraph>

      <SectionTitle>10. Changes to This Policy</SectionTitle>
      <Paragraph>We may update this Privacy Policy from time to time. Material changes will be communicated at least 14 days before taking effect.</Paragraph>

      <SectionTitle>11. Contact Us</SectionTitle>
      <Paragraph>For any questions or requests: <strong>privacy@rideshare.ug</strong></Paragraph>
    </div>
  );
}

function TermsOfService() {
  return (
    <div>
      <div className="text-center mb-10 pb-8 border-b border-border">
        <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight mb-2">Terms of Service</h1>
        <p className="text-sm text-text3">Last updated: January 2025 · Version 1.0</p>
      </div>

      <WarningBox title="Important">
        These Terms constitute a legally binding agreement between you and RideShare. Please read them carefully before using the platform.
      </WarningBox>

      <SectionTitle>1. Acceptance of Terms</SectionTitle>
      <Paragraph>
        By creating an account, accessing, or using RideShare, you agree to be bound by these Terms of Service, our Privacy Policy, and our Liability Disclaimer.
      </Paragraph>

      <SectionTitle>2. Description of Service</SectionTitle>
      <Paragraph>
        RideShare is a ride-matching platform that connects university students who are traveling to similar destinations. The platform allows users to post rides, search available rides, request to join, communicate through in-app chat, verify through Safety PINs, and rate ride buddies.
      </Paragraph>

      <WarningBox title="What RideShare is NOT">
        RideShare is NOT a transport provider. We do not operate vehicles, employ drivers, set fares, handle payments, or control transportation services. The boda-boda operators are independent third parties.
      </WarningBox>

      <SectionTitle>3. Eligibility</SectionTitle>
      <ul className="list-disc pl-5 space-y-2">
        <ListItem>Be at least 18 years of age</ListItem>
        <ListItem>Be currently enrolled at a recognized university</ListItem>
        <ListItem>Have a valid email address</ListItem>
        <ListItem>Not have been previously permanently banned</ListItem>
      </ul>

      <SectionTitle>4. Account Registration</SectionTitle>
      <Paragraph>You must provide accurate, complete, and truthful information when registering. You are responsible for maintaining the confidentiality of your account credentials.</Paragraph>

      <SectionTitle>5. User Conduct</SectionTitle>
      <Paragraph>You agree not to post fake rides, harass other users, use the platform for illegal activities, manipulate trust scores, impersonate others, or circumvent security features.</Paragraph>

      <SectionTitle>6. Ride Posting Rules</SectionTitle>
      <Paragraph>When posting a ride, you represent that the origin, destination, timing, and seat availability are accurate.</Paragraph>

      <SectionTitle>7. Safety Responsibilities</SectionTitle>
      <WarningBox title="Your safety is your responsibility">
        RideShare provides tools to help you make safer decisions, but these tools do not guarantee your safety. You are always responsible for your personal safety when meeting strangers and using transportation services.
      </WarningBox>

      <SectionTitle>8. Trust Score System</SectionTitle>
      <Paragraph>The trust score is an automated rolling average of ratings. Your trust score is visible to other users and cannot be manually edited. Attempts to manipulate trust scores are prohibited.</Paragraph>

      <SectionTitle>9. In-App Chat</SectionTitle>
      <Paragraph>Chat is for coordinating ride logistics only. Messages expire and become inaccessible 1 hour after the ride is completed.</Paragraph>

      <SectionTitle>10. Blocking and Reporting</SectionTitle>
      <Paragraph>You can block any user at any time. Blocked users cannot see your rides or send you requests. Report any user who violates these Terms.</Paragraph>

      <SectionTitle>11. Limitation of Liability</SectionTitle>
      <WarningBox title="Read this section carefully">
        RideShare shall not be liable for any personal injury, theft, accidents, financial losses, or any damages arising from your use of the platform. The platform is provided &ldquo;as is&rdquo; without warranties of any kind.
      </WarningBox>

      <SectionTitle>12. Suspension and Termination</SectionTitle>
      <Paragraph>We may suspend or terminate your account for violation of these Terms, conduct that threatens safety, fraudulent activity, or extended inactivity.</Paragraph>

      <SectionTitle>13. Governing Law</SectionTitle>
      <Paragraph>These Terms are governed by the laws of the Republic of Uganda.</Paragraph>

      <SectionTitle>14. Contact</SectionTitle>
      <Paragraph>For questions: <strong>hello@rideshare.ug</strong> | Appeals: <strong>appeals@rideshare.ug</strong></Paragraph>
    </div>
  );
}

function LiabilityDisclaimer() {
  return (
    <div>
      <div className="text-center mb-10 pb-8 border-b border-border">
        <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight mb-2">Liability Disclaimer</h1>
        <p className="text-sm text-text3">Last updated: January 2025 · Version 1.0</p>
      </div>

      <SectionTitle>1. Nature of Service</SectionTitle>
      <Paragraph>
        RideShare is a software application that provides a platform for university students to find and coordinate shared rides. The platform&apos;s sole function is to display ride postings and allow users to indicate interest. RideShare does not operate, manage, control, or oversee any aspect of the actual transportation.
      </Paragraph>

      <SectionTitle>2. No Transportation Services</SectionTitle>
      <Paragraph>RideShare does not:</Paragraph>
      <ul className="list-disc pl-5 space-y-2">
        <ListItem>Operate, dispatch, or manage any vehicles</ListItem>
        <ListItem>Employ, contract with, or receive payments from any drivers</ListItem>
        <ListItem>Set, negotiate, or enforce any fares or prices</ListItem>
        <ListItem>Control the route, speed, or driving behavior of any vehicle</ListItem>
        <ListItem>Provide insurance coverage for any passenger or driver</ListItem>
      </ul>

      <SectionTitle>3. No Driver Relationships</SectionTitle>
      <Paragraph>
        There is no legal, employment, agency, partnership, or contractor relationship between RideShare and any boda-boda operator. Boda-boda operators operate independently and bear full responsibility for their own licensing, insurance, and vehicle safety.
      </Paragraph>

      <SectionTitle>4. No Payment Handling</SectionTitle>
      <Paragraph>
        RideShare does not process, handle, receive, hold, or transmit any payments. Cost-sharing arrangements are private matters between individuals. RideShare has no visibility into whether fares were paid or how they were split.
      </Paragraph>

      <SectionTitle>5. No User Verification</SectionTitle>
      <WarningBox title="Critical limitation">
        None of our verification tools guarantee the safety, identity, character, or intentions of any person. A verified email does not mean the person is honest. A high trust score does not mean the person is safe. A correct Safety PIN does not mean the person is who they claim to be.
      </WarningBox>

      <SectionTitle>6. Physical Safety</SectionTitle>
      <Paragraph>
        RideShare cannot guarantee your physical safety. Riding on a boda-boda inherently carries risks including traffic accidents, falls, injuries, and death. You are solely responsible for assessing whether a ride is safe, checking the operator and vehicle, sharing travel plans with others, and wearing a helmet.
      </Paragraph>

      <WarningBox title="In summary">
        By using RideShare, you acknowledge that: (a) RideShare is a matching platform only, (b) all transportation is provided by independent third-party operators, (c) you assume full responsibility for your personal safety, (d) verification tools are limited and do not guarantee safety, and (e) RideShare is not liable for any damages arising from your use of the platform.
      </WarningBox>
    </div>
  );
}
