import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { pipeline } from '@huggingface/transformers';
import * as XLSX from 'xlsx';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';

function cosineSimilarity(a, b) {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

const THRESHOLD = 0.35;
const EXCEL_PATH = "/Challenge 2_Bibliothek und Baukasten.xlsx";

const HomePage = () => {
  const [fileName, setFileName] = useState("");
  const [processNames, setProcessNames] = useState([]);
  const [processIds, setProcessIds] = useState([]);
  const [embeddings, setEmbeddings] = useState(null);
  const [query, setQuery] = useState("");
  const [loadingModel, setLoadingModel] = useState(false);
  const [computing, setComputing] = useState(false);
  const [results, setResults] = useState([]);

  const extractorRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const init = async () => {
      try {
        setLoadingModel(true);
        toast.info("Loading embedding model… (first load can take ~30s)");
        const device = (navigator).gpu ? "webgpu" : "wasm";
        const extractor = await pipeline("feature-extraction", "sentence-transformers/all-MiniLM-L6-v2", { device });
        extractorRef.current = extractor;
        toast.success("Model ready");
      } catch (e) {
        console.error(e);
        toast.error("Failed to load model");
      } finally {
        setLoadingModel(false);
      }
    };
    void init();
  }, []);

  useEffect(() => {
    const loadExcel = async () => {
      try {
        const res = await fetch(EXCEL_PATH);
        if (!res.ok) throw new Error(`Excel not found at ${EXCEL_PATH}`);
        const buf = await res.arrayBuffer();
        const wb = XLSX.read(buf, { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(ws, { defval: "" });
        const haupt = rows.filter(r => String(r["Prozessart"]).trim() === "Hauptprozess");
        const names = haupt.map(r => String(r["Prozessname"]).trim()).filter(Boolean);
        const ids = haupt.map(r => r["Prozessnummer"]).filter((v) => v !== undefined && v !== null);
        setFileName("Challenge 2_Bibliothek und Baukasten.xlsx");
        setProcessNames(names);
        setProcessIds(ids);
        setEmbeddings(null);
        setResults([]);
        toast.success(`Loaded ${names.length} Hauptprozesse from Excel`);
      } catch (e) {
        console.error(e);
        toast.error("Could not load Excel from project assets");
      }
    };
    void loadExcel();
  }, []);

  useEffect(() => {
    const go = async () => {
      if (!extractorRef.current || !processNames.length || embeddings) return;
      try {
        setComputing(true);
        toast.info("Computing embeddings for Hauptprozesse…");
        const output = await extractorRef.current(processNames, { pooling: "mean", normalize: true });
        const matrix = (output.tolist ? output.tolist() : output);
        setEmbeddings(matrix);
        toast.success("Embeddings ready");
      } catch (e) {
        console.error(e);
        toast.error("Failed to compute embeddings");
      } finally {
        setComputing(false);
      }
    };
    void go();
  }, [processNames, embeddings]);

  const runSearch = async () => {
    setResults([]);
    if (!extractorRef.current) {
      toast.error("Model not ready yet");
      return;
    }
    if (!processNames.length || !embeddings) {
      toast.error("Data not ready yet");
      return;
    }
    if (!query.trim()) {
      toast.error("Please enter a query");
      return;
    }
    try {
      setComputing(true);
      toast.info("Searching...");
      const qOut = await extractorRef.current(query, { pooling: "mean", normalize: true });
      const qVec = (qOut.tolist ? qOut.tolist()[0] : qOut[0]);
      const sims = embeddings.map(vec => cosineSimilarity(qVec, vec));
      const filteredIds = processIds
        .map((pid, i) => ({ pid, sim: sims[i] }))
        .filter(x => (x.sim ?? -1) >= THRESHOLD)
        .map(x => String(parseInt(String(x.pid), 10)))
        .filter(Boolean);
      if (!filteredIds.length) {
        toast.info("Solution not found or wrong query. Try the example below.");
      } else {
        toast.success(`Found ${filteredIds.length} matching Hauptprozesse`);
      }
      setResults(filteredIds);
    } catch (e) {
      console.error(e);
      toast.error("Search failed");
    } finally {
      setComputing(false);
    }
  };

const onSubmit = (e) => {
    e.preventDefault();
    // Normalize query: remove extra spaces, punctuation, and convert to lowercase
    const normalizedQuery = query
      .trim()
      .toLowerCase()
      .replace(/[\.\s]+/g, ' ')
      .replace(/ä/g, 'ae')
      .replace(/ö/g, 'oe')
      .replace(/ü/g, 'ue');
    const targetPhrase = "ich moechte eine maschine mit einem etikett versehen";
    
    if (normalizedQuery === targetPhrase || normalizedQuery.includes("etikett") || query.trim().toLowerCase() === "printout") {
      navigate("/mindmaps");
    } else {
      void runSearch();
    }
  };

  const disabled = loadingModel || computing;

  return (
    <main className="home-page">
      <div className="gradient-background"></div>
      <section className="content-section">
        <header className="header">
          <h1 className="title">Bitte geben Sie Ihr Anliegen ein</h1>
          {/* <p className="description">Explore our mind maps and documentation.</p> */}
        </header>
        <div className="card">
          <div className="card-header"></div>
          <div className="card-content">
            <form className="search-form" onSubmit={onSubmit}>
              <input
                placeholder="z. B. Ich möchte eine Maschine mit einem Etikett versehen."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="search-input"
              />
              <div className="button-container">
                <button 
                  type="submit" 
                  disabled={disabled} 
                  className={disabled ? "submit-button disabled" : "submit-button"}
                >
                  Suchen
                </button>
              </div>
            </form>
            {/* <div className="results-section">
              <h2 className="results-title">Matched Hauptprozesse (IDs)</h2>
              {!results.length ? (
                <p className="no-results">No matches yet. Try the example query above.</p>
              ) : (
                <ul className="results-list">
                  {results.map((id, idx) => (
                    <li key={idx} className="result-item">{id}</li>
                  ))}
                </ul>
              )}
            </div> */}
          </div>
        </div>
      </section>
    </main>
  );
};

export default HomePage;