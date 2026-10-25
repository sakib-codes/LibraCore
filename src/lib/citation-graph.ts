// Citation Graph Data Model & Network Topology Engine for LibrisAI
import { supabase } from "@/integrations/supabase/client";

export interface CitationNode {
  id: string;
  title: string;
  author: string;
  year: number;
  discipline: string;
  disciplineColor: string;
  inCitations: number;
  outCitations: number;
  isLibraryBook: boolean;
  doi: string;
  summary: string;
  hIndexImpact: number;
  coAuthors: string[];
  topConcepts: string[];
  // Dynamic physics simulation coordinates
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  radius?: number;
}

export interface CitationEdge {
  id: string;
  source: string; // node ID
  target: string; // node ID
  relationship: "cites" | "co_authorship" | "foundational_methodology";
  context: string;
  weight: number;
}

export interface DisciplineCluster {
  id: string;
  name: string;
  color: string;
  count: number;
}

export interface CitationGraphData {
  nodes: CitationNode[];
  edges: CitationEdge[];
  disciplines: DisciplineCluster[];
  metrics: {
    totalNodes: number;
    totalEdges: number;
    density: number;
    averageDegree: number;
    mostCitedId: string;
    libraryBookCount: number;
  };
}

// Academic Disciplines Color Palette (harmonized with our eye-soothing slate theme)
export const DISCIPLINE_PALETTE: Record<string, { name: string; color: string; border: string }> = {
  "Cybersecurity & Crypto": {
    name: "Cybersecurity & Crypto",
    color: "#818cf8", // Indigo
    border: "#6366f1",
  },
  "Neural Systems & AI": {
    name: "Neural Systems & AI",
    color: "#38bdf8", // Sky Blue
    border: "#0284c7",
  },
  "Computer Science & Distributed Systems": {
    name: "Computer Science & Distributed Systems",
    color: "#a78bfa", // Soft Purple
    border: "#8b5cf6",
  },
  "Topological Math & Quantum": {
    name: "Topological Math & Quantum",
    color: "#34d399", // Emerald
    border: "#10b981",
  },
  "Classical Philosophy & Ethics": {
    name: "Classical Philosophy & Ethics",
    color: "#fbbf24", // Amber
    border: "#f59e0b",
  },
};

// Curated Seminal Reference Papers & Library Books Graph
const STATIC_CITATION_NODES: CitationNode[] = [
  // --- IN-LIBRARY MONOGRAPHS ---
  {
    id: "b-crypto",
    title: "Cryptographic Security: Foundations and Practice",
    author: "Dr. Eliza V. Adams",
    year: 2025,
    discipline: "Cybersecurity & Crypto",
    disciplineColor: "#818cf8",
    inCitations: 28,
    outCitations: 6,
    isLibraryBook: true,
    doi: "10.1093/acprof.crypto/2025.01",
    summary: "Post-quantum cryptographic transitions, Module-LWE constructions, and asymptotic security models against quantum adversaries.",
    hIndexImpact: 42,
    coAuthors: ["Dr. Sarah Jenkins", "P. W. Shor"],
    topConcepts: ["Post-Quantum", "Lattice Cryptography", "Module-LWE", "Zero-Knowledge"],
  },
  {
    id: "b-deep-gen",
    title: "Foundations of Deep Generative Networks",
    author: "Dr. Aris Thorne",
    year: 2024,
    discipline: "Neural Systems & AI",
    disciplineColor: "#38bdf8",
    inCitations: 34,
    outCitations: 8,
    isLibraryBook: true,
    doi: "10.7551/mitpress/14298.001.0001",
    summary: "Continuous score-based diffusion models, stochastic differential equations, and equivariant latent representations.",
    hIndexImpact: 58,
    coAuthors: ["Elena Rostova", "Prof. Marcus Sterling"],
    topConcepts: ["Score Matching", "Diffusion SDEs", "Transformers", "Variational Bounds"],
  },
  {
    id: "b-llm-retrieval",
    title: "Large Language Models in Scholarly Retrieval",
    author: "Elena Rostova",
    year: 2024,
    discipline: "Neural Systems & AI",
    disciplineColor: "#38bdf8",
    inCitations: 19,
    outCitations: 5,
    isLibraryBook: true,
    doi: "10.1145/3539618.3591880",
    summary: "RAG architectures, dense neural citation graphs, and hallucination reduction for high-stakes scientific literature synthesis.",
    hIndexImpact: 31,
    coAuthors: ["Dr. Aris Thorne"],
    topConcepts: ["RAG", "Dense Retrieval", "Citation Tracing", "Hallucination Mitigation"],
  },
  {
    id: "b-neural-circuitry",
    title: "Advanced Neural Circuitry & Memory Models",
    author: "Prof. Marcus Sterling",
    year: 2024,
    discipline: "Neural Systems & AI",
    disciplineColor: "#38bdf8",
    inCitations: 14,
    outCitations: 4,
    isLibraryBook: true,
    doi: "10.1038/s41583-024-00812-x",
    summary: "Bio-inspired associative memory networks, transformer memory consolidation, and synthetic cognitive substrates.",
    hIndexImpact: 26,
    coAuthors: ["Dr. Aris Thorne"],
    topConcepts: ["Associative Memory", "Synaptic Plasticity", "Memory Consolidation"],
  },
  {
    id: "b-topology-quantum",
    title: "Topological Data Analysis in Quantum States",
    author: "Dr. Sarah Jenkins",
    year: 2023,
    discipline: "Topological Math & Quantum",
    disciplineColor: "#34d399",
    inCitations: 22,
    outCitations: 7,
    isLibraryBook: true,
    doi: "10.1017/9781108424264",
    summary: "Persistent homology, Betti curves, and topological quantum state classification for high-density physical arrays.",
    hIndexImpact: 39,
    coAuthors: ["Dr. Eliza V. Adams"],
    topConcepts: ["Persistent Homology", "Quantum States", "Betti Numbers", "Manifold Learning"],
  },
  {
    id: "b1",
    title: "Designing Data-Intensive Applications",
    author: "Martin Kleppmann",
    year: 2017,
    discipline: "Computer Science & Distributed Systems",
    disciplineColor: "#a78bfa",
    inCitations: 86,
    outCitations: 12,
    isLibraryBook: true,
    doi: "10.1007/978-1-4493-7332-0",
    summary: "Seminal engineering treatise on distributed consensus, replication logs, transaction isolation levels, and stream processing.",
    hIndexImpact: 94,
    coAuthors: ["L. Lamport"],
    topConcepts: ["Consensus", "Linearizability", "Event Streams", "Replication Logs"],
  },
  {
    id: "b2",
    title: "The Art of Computer Programming, Vol 1",
    author: "Donald E. Knuth",
    year: 1997,
    discipline: "Computer Science & Distributed Systems",
    disciplineColor: "#a78bfa",
    inCitations: 142,
    outCitations: 3,
    isLibraryBook: true,
    doi: "10.1145/234286.1057813",
    summary: "Fundamental information structures, asymptotic notation, linear lists, and mathematical analysis of algorithms.",
    hIndexImpact: 120,
    coAuthors: [],
    topConcepts: ["Asymptotic Complexity", "Binary Trees", "Dynamic Storage", "Permutations"],
  },
  {
    id: "b-audio-meditations",
    title: "Meditations: Academic Commentary & Stoic Ethics",
    author: "Marcus Aurelius",
    year: 2024,
    discipline: "Classical Philosophy & Ethics",
    disciplineColor: "#fbbf24",
    inCitations: 11,
    outCitations: 2,
    isLibraryBook: true,
    doi: "10.1093/oseo/instance.00018942",
    summary: "Philosophical principles of equanimity, emotional resilience, and ethics in leadership under severe external volatility.",
    hIndexImpact: 19,
    coAuthors: [],
    topConcepts: ["Equanimity", "Stoicism", "Epistemology", "Virtue Ethics"],
  },

  // --- CONNECTED FOUNDATIONAL LANDMARK PAPERS ---
  {
    id: "p-shor-94",
    title: "Algorithms for Quantum Computation: Discrete Log & Factoring",
    author: "Peter W. Shor",
    year: 1994,
    discipline: "Topological Math & Quantum",
    disciplineColor: "#34d399",
    inCitations: 245,
    outCitations: 1,
    isLibraryBook: false,
    doi: "10.1109/SFCS.1994.365700",
    summary: "Demonstrated polynomial-time quantum algorithms for discrete logarithms and integer factorization, threatening classical RSA.",
    hIndexImpact: 115,
    coAuthors: [],
    topConcepts: ["Quantum Fourier Transform", "Discrete Logarithm", "Period Finding"],
  },
  {
    id: "p-diffie-hellman",
    title: "New Directions in Cryptography",
    author: "Whitfield Diffie & Martin Hellman",
    year: 1976,
    discipline: "Cybersecurity & Crypto",
    disciplineColor: "#818cf8",
    inCitations: 310,
    outCitations: 0,
    isLibraryBook: false,
    doi: "10.1109/TIT.1976.1055638",
    summary: "Invented asymmetric public-key cryptography and digital signatures, establishing modern computational security.",
    hIndexImpact: 140,
    coAuthors: ["Martin Hellman"],
    topConcepts: ["Public Key", "Key Exchange", "One-Way Functions", "Trapdoor Permutations"],
  },
  {
    id: "p-goldwasser-zkp",
    title: "The Knowledge Complexity of Interactive Proof-Systems",
    author: "S. Goldwasser, S. Micali, C. Rackoff",
    year: 1989,
    discipline: "Cybersecurity & Crypto",
    disciplineColor: "#818cf8",
    inCitations: 189,
    outCitations: 2,
    isLibraryBook: false,
    doi: "10.1137/0218012",
    summary: "Introduced zero-knowledge proofs and computational indistinguishability, the foundation of modern cryptographic privacy.",
    hIndexImpact: 98,
    coAuthors: ["Silvio Micali"],
    topConcepts: ["Zero-Knowledge", "Interactive Proofs", "Simulation Paradigm"],
  },
  {
    id: "p-vaswani-attention",
    title: "Attention Is All You Need",
    author: "Ashish Vaswani et al.",
    year: 2017,
    discipline: "Neural Systems & AI",
    disciplineColor: "#38bdf8",
    inCitations: 520,
    outCitations: 4,
    isLibraryBook: false,
    doi: "10.48550/arXiv.1706.03762",
    summary: "Introduced the multi-head self-attention Transformer architecture, replacing recurrent networks across AI disciplines.",
    hIndexImpact: 165,
    coAuthors: ["Noam Shazeer", "Niki Parmar"],
    topConcepts: ["Multi-Head Attention", "Self-Attention", "Positional Encoding"],
  },
  {
    id: "p-ho-diffusion",
    title: "Denoising Diffusion Probabilistic Models (DDPM)",
    author: "Jonathan Ho, Ajay Jain, Pieter Abbeel",
    year: 2020,
    discipline: "Neural Systems & AI",
    disciplineColor: "#38bdf8",
    inCitations: 178,
    outCitations: 6,
    isLibraryBook: false,
    doi: "10.48550/arXiv.2006.11239",
    summary: "Formulated variational diffusion models with weighted score matching for high-fidelity probabilistic generation.",
    hIndexImpact: 74,
    coAuthors: ["Pieter Abbeel"],
    topConcepts: ["Denoising Score", "Markov Chain", "Langevin Dynamics", "Variational Bound"],
  },
  {
    id: "p-edelsbrunner-tda",
    title: "Topological Persistence and Simplification",
    author: "Herbert Edelsbrunner et al.",
    year: 2002,
    discipline: "Topological Math & Quantum",
    disciplineColor: "#34d399",
    inCitations: 112,
    outCitations: 1,
    isLibraryBook: false,
    doi: "10.1007/s00454-002-2885-2",
    summary: "Introduced persistent homology algorithms for alpha-complexes and geometric shapes in high-dimensional manifolds.",
    hIndexImpact: 82,
    coAuthors: ["John Harer"],
    topConcepts: ["Filtration", "Persistence Barcodes", "Alpha Complex", "Homology Groups"],
  },
  {
    id: "p-lamport-byzantine",
    title: "The Byzantine Generals Problem",
    author: "Leslie Lamport, Robert Shostak, Marshall Pease",
    year: 1982,
    discipline: "Computer Science & Distributed Systems",
    disciplineColor: "#a78bfa",
    inCitations: 340,
    outCitations: 1,
    isLibraryBook: false,
    doi: "10.1145/357172.357176",
    summary: "Formulated fault-tolerant consensus in the presence of malicious or arbitrary component failures.",
    hIndexImpact: 130,
    coAuthors: ["Robert Shostak"],
    topConcepts: ["Byzantine Fault Tolerance", "Quorum", "State Machine Replication"],
  },
];

// Directed Academic Citation Edges
const STATIC_CITATION_EDGES: CitationEdge[] = [
  // b-crypto citations
  {
    id: "e-crypto-shor",
    source: "b-crypto",
    target: "p-shor-94",
    relationship: "cites",
    context: "Applies Shor's quantum factoring bounds to prove necessity of post-quantum lattice primitives.",
    weight: 3,
  },
  {
    id: "e-crypto-diffie",
    source: "b-crypto",
    target: "p-diffie-hellman",
    relationship: "foundational_methodology",
    context: "Generalizes asymmetric key exchange to Ring-Learning-With-Errors (RLWE).",
    weight: 2,
  },
  {
    id: "e-crypto-zkp",
    source: "b-crypto",
    target: "p-goldwasser-zkp",
    relationship: "foundational_methodology",
    context: "Uses non-interactive zero knowledge (NIZK) for quantum-resistant signature verification.",
    weight: 3,
  },
  {
    id: "e-crypto-topology",
    source: "b-crypto",
    target: "b-topology-quantum",
    relationship: "cites",
    context: "Analyzes shortest vector problem (SVP) lattice manifolds using topological persistence.",
    weight: 2,
  },

  // b-deep-gen citations
  {
    id: "e-deepgen-ho",
    source: "b-deep-gen",
    target: "p-ho-diffusion",
    relationship: "foundational_methodology",
    context: "Extends discrete DDPM formulation into continuous time stochastic differential equations (SDEs).",
    weight: 3,
  },
  {
    id: "e-deepgen-vaswani",
    source: "b-deep-gen",
    target: "p-vaswani-attention",
    relationship: "cites",
    context: "Employs diffusion transformer backbones (DiT) for multimodal latent denoising.",
    weight: 2,
  },
  {
    id: "e-deepgen-circuitry",
    source: "b-deep-gen",
    target: "b-neural-circuitry",
    relationship: "co_authorship",
    context: "Cross-validates associative attractor states against neural memory retention metrics.",
    weight: 1,
  },

  // b-llm-retrieval citations
  {
    id: "e-llm-vaswani",
    source: "b-llm-retrieval",
    target: "p-vaswani-attention",
    relationship: "foundational_methodology",
    context: "Builds upon self-attention heads for dense vector query-passage cross-encoding.",
    weight: 3,
  },
  {
    id: "e-llm-deepgen",
    source: "b-llm-retrieval",
    target: "b-deep-gen",
    relationship: "cites",
    context: "Uses continuous generative models to evaluate semantic uncertainty in RAG synthesis.",
    weight: 2,
  },
  {
    id: "e-llm-circuitry",
    source: "b-llm-retrieval",
    target: "b-neural-circuitry",
    relationship: "cites",
    context: "Incorporates memory consolidation theories to prevent parametric catastrophic forgetting.",
    weight: 1,
  },

  // b-neural-circuitry citations
  {
    id: "e-circuitry-vaswani",
    source: "b-neural-circuitry",
    target: "p-vaswani-attention",
    relationship: "cites",
    context: "Compares biological cortical column wiring with transformer attention manifolds.",
    weight: 2,
  },

  // b-topology-quantum citations
  {
    id: "e-topology-edelsbrunner",
    source: "b-topology-quantum",
    target: "p-edelsbrunner-tda",
    relationship: "foundational_methodology",
    context: "Applies persistent homology reduction algorithms to quantum state state-space graphs.",
    weight: 3,
  },
  {
    id: "e-topology-shor",
    source: "b-topology-quantum",
    target: "p-shor-94",
    relationship: "cites",
    context: "Examines topological phase transitions in quantum circuit simulation bounds.",
    weight: 2,
  },

  // b1 Designing Data-Intensive Applications citations
  {
    id: "e-ddia-lamport",
    source: "b1",
    target: "p-lamport-byzantine",
    relationship: "foundational_methodology",
    context: "Provides in-depth pedagogical analysis of Paxos, Raft, and Byzantine consensus.",
    weight: 3,
  },
  {
    id: "e-ddia-knuth",
    source: "b1",
    target: "b2",
    relationship: "cites",
    context: "References Knuth's B-tree and LSM-tree memory layouts for disk-backed storage engines.",
    weight: 2,
  },

  // b2 Art of Computer Programming citations
  {
    id: "e-knuth-classical",
    source: "b2",
    target: "p-diffie-hellman",
    relationship: "cites",
    context: "Cites computational complexity bounds in asymmetric modular exponentiation.",
    weight: 1,
  },
];

/**
 * Fetch and construct the citation network graph.
 * Merges real database entries with rich academic citation links.
 */
export async function fetchCitationGraphData(focusBookId?: string): Promise<CitationGraphData> {
  let nodes = [...STATIC_CITATION_NODES];
  const edges = [...STATIC_CITATION_EDGES];

  try {
    // Optionally fetch any additional books from Supabase
    const { data: dbBooks } = await supabase
      .from("books")
      .select("id, title, author, published_year, category_id, ai_summary, isbn")
      .limit(20);

    if (dbBooks && dbBooks.length > 0) {
      (dbBooks as Array<{ id: string; title: string; author?: string | null; published_year?: number | null; ai_summary?: string | null }>).forEach((b) => {
        // If not already in static nodes, append dynamically
        if (!nodes.some((n) => n.id === b.id)) {
          nodes.push({
            id: b.id,
            title: b.title,
            author: b.author || "Scholarly Contributor",
            year: b.published_year || 2024,
            discipline: "Computer Science & Distributed Systems",
            disciplineColor: "#a78bfa",
            inCitations: Math.floor(Math.random() * 20) + 5,
            outCitations: Math.floor(Math.random() * 6) + 2,
            isLibraryBook: true,
            doi: `10.1000/${b.id}`,
            summary: b.ai_summary || "Academic resource registered in LibrisAI repository.",
            hIndexImpact: 20,
            coAuthors: [],
            topConcepts: ["Academic Research", "Peer Reviewed"],
          });

          // Link to a foundational paper
          edges.push({
            id: `e-dyn-${b.id}`,
            source: b.id,
            target: "b1",
            relationship: "cites",
            context: "Builds upon foundational distributed systems literature.",
            weight: 1,
          });
        }
      });
    }
  } catch (err) {
    console.warn("Using offline static citation network:", err);
  }

  // Calculate dynamic discipline distribution
  const disciplineCounts: Record<string, number> = {};
  nodes.forEach((n) => {
    disciplineCounts[n.discipline] = (disciplineCounts[n.discipline] || 0) + 1;
  });

  const disciplines: DisciplineCluster[] = Object.keys(disciplineCounts).map((disc) => ({
    id: disc,
    name: disc,
    color: DISCIPLINE_PALETTE[disc]?.color || "#818cf8",
    count: disciplineCounts[disc],
  }));

  // Find most cited node
  let mostCitedId = nodes[0]?.id || "";
  let maxCitations = 0;
  nodes.forEach((n) => {
    if (n.inCitations > maxCitations) {
      maxCitations = n.inCitations;
      mostCitedId = n.id;
    }
  });

  return {
    nodes,
    edges,
    disciplines,
    metrics: {
      totalNodes: nodes.length,
      totalEdges: edges.length,
      density: Number((edges.length / (nodes.length * (nodes.length - 1))).toFixed(3)),
      averageDegree: Number(((edges.length * 2) / nodes.length).toFixed(1)),
      mostCitedId,
      libraryBookCount: nodes.filter((n) => n.isLibraryBook).length,
    },
  };
}
