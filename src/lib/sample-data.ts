/**
 * ResumeLoops Fictional Sample Data
 * Intended strictly for visual development, component prototyping, and testing.
 * This does NOT represent a real customer, signed-in user, or real personal credentials.
 */

import { Resume, TemplateId } from "@/types/resume";

export interface TemplateDefinition {
  id: TemplateId;
  name: string;
  category: "Executive" | "Minimal" | "Modern" | "Professional";
  description: string;
  atsCompatibility: number;
  rating: string;
  reviewCount: number;
}

export const DEMO_TEMPLATES: TemplateDefinition[] = [
  {
    id: "swiss-chronicle",
    name: "The Swiss Chronicle",
    category: "Executive",
    description:
      "A masterclass in editorial typography and structured hierarchy, engineered for senior engineering leadership and staff roles.",
    atsCompatibility: 98,
    rating: "4.9",
    reviewCount: 1240,
  },
  {
    id: "stripe-mono",
    name: "Stripe Mono",
    category: "Minimal",
    description:
      "Ultra-clean structural layout emphasizing whitespace, monospaced metadata, and high scanning velocity for technology firms.",
    atsCompatibility: 99,
    rating: "4.8",
    reviewCount: 850,
  },
  {
    id: "linear-grid",
    name: "Linear Grid",
    category: "Modern",
    description:
      "Precision-engineered asymmetrical layout inspired by modern developer tooling interfaces and developer platforms.",
    atsCompatibility: 95,
    rating: "5.0",
    reviewCount: 2410,
  },
  {
    id: "classic-oxford",
    name: "Classic Oxford",
    category: "Professional",
    description:
      "Traditional single-column formatting optimized for formal corporate, academic, and financial institutional requirements.",
    atsCompatibility: 100,
    rating: "4.7",
    reviewCount: 430,
  },
];

export const DEMO_RESUME: Resume = {
  id: "demo-resume-1",
  title: "Staff Infrastructure Engineer v4",
  targetRole: "Senior Staff Infrastructure Engineer",
  targetCompany: "Stripe",
  templateId: "swiss-chronicle",
  lastModified: "2 minutes ago",
  atsScore: 96,
  sectionOrder: [
    "personal",
    "summary",
    "experience",
    "skills",
    "education",
    "projects",
    "certifications",
  ],
  personalInfo: {
    firstName: "Alexandre",
    lastName: "Vance",
    email: "alexandre.vance.demo@resumeloops.io",
    phone: "+1 (555) 389-2140",
    location: "San Francisco, CA",
    website: "https://vance-demo.dev",
    linkedin: "linkedin.com/in/alexandre-vance-demo",
    github: "github.com/avance-demo",
    title: "Staff Infrastructure Engineer & Distributed Systems Lead",
  },
  summary:
    "Results-driven Staff Engineer with 8+ years of expertise designing high-throughput distributed architectures, lowering cloud infrastructural overhead by 42%, and mentoring high-performing engineering squads across tier-one tech enterprises.",
  experience: [
    {
      id: "exp-1",
      role: "Staff Infrastructure Engineer",
      company: "CloudScale Systems (Demo)",
      location: "San Francisco, CA",
      startDate: "2022",
      endDate: "Present",
      isCurrentRole: true,
      bullets: [
        "Architected multi-region Kubernetes control plane handling 120,000 requests/sec with 99.995% availability SLA.",
        "Spearheaded zero-trust service mesh migration across 240+ microservices, cutting inter-service latency by 28%.",
        "Engineered automated cost-governance daemon reducing annualized AWS compute expenditures by $1.4M.",
      ],
    },
    {
      id: "exp-2",
      role: "Senior Distributed Systems Engineer",
      company: "FinFlow Technologies (Demo)",
      location: "New York, NY",
      startDate: "2019",
      endDate: "2022",
      isCurrentRole: false,
      bullets: [
        "Led core ledger transactional pipeline refactor, increasing throughput from 12k to 65k TPS during peak market opens.",
        "Designed deterministic event replay framework utilizing Apache Kafka and Raft-based consensus protocol.",
        "Mentored 6 junior and mid-level engineers, establishing company-wide distributed systems RFC standards.",
      ],
    },
  ],
  education: [
    {
      id: "edu-1",
      degree: "B.S. in Computer Science",
      institution: "University of California, Berkeley",
      location: "Berkeley, CA",
      graduationYear: "2017",
      honors: "Magna Cum Laude",
    },
  ],
  skillCategories: [
    {
      id: "skills-1",
      categoryName: "Systems & Cloud",
      skills: [
        "Distributed Systems",
        "Kubernetes",
        "Go (Golang)",
        "Rust",
        "Terraform",
        "AWS / GCP",
      ],
    },
    {
      id: "skills-2",
      categoryName: "Data & Consensus",
      skills: ["Apache Kafka", "PostgreSQL", "Raft Consensus", "Redis", "gRPC"],
    },
  ],
  projects: [
    {
      id: "proj-1",
      name: "ChronoSync (Open Source)",
      description:
        "High-performance distributed clock synchronization library with nanosecond precision for partitioned networks.",
      technologies: ["Rust", "eBPF", "UDP"],
      url: "https://github.com/avance-demo/chronosync",
    },
  ],
  certifications: [
    {
      id: "cert-1",
      name: "Certified Kubernetes Administrator (CKA)",
      issuer: "Cloud Native Computing Foundation",
      date: "2023",
    },
  ],
};

export const DEMO_RECENT_RESUMES: Array<{
  id: string;
  title: string;
  targetRole: string;
  targetCompany: string;
  templateName: string;
  atsScore: number;
  lastEdited: string;
}> = [
  {
    id: "resume-1",
    title: "Staff Infrastructure Engineer v4",
    targetRole: "Senior Staff Engineer",
    targetCompany: "Stripe",
    templateName: "The Swiss Chronicle",
    atsScore: 96,
    lastEdited: "2m ago",
  },
  {
    id: "resume-2",
    title: "Principal Distributed Systems Lead",
    targetRole: "Principal Systems Architect",
    targetCompany: "Datadog",
    templateName: "Stripe Mono",
    atsScore: 94,
    lastEdited: "1d ago",
  },
  {
    id: "resume-3",
    title: "Core Growth Tech Lead",
    targetRole: "Engineering Manager - Growth",
    targetCompany: "Linear",
    templateName: "Linear Grid",
    atsScore: 91,
    lastEdited: "4d ago",
  },
];
