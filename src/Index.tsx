import React, { useState, useEffect, useRef }from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { pipeline } from "@huggingface/transformers";
import * as XLSX from "xlsx";

// Simple cosine similarity helper
function cosineSimilarity(a: number[], b: number[]) {
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

const Index: React.FC = () => {
  const [fileName, setFileName] = React.useState<string>("");
  const [processNames, setProcessNames] = React.useState<string[]>([]);
  const [processIds, setProcessIds] = React.useState<(string | number)[]>([]);
  const [embeddings, setEmbeddings] = React.useState<number[][] | null>(null);
  const [query, setQuery] = React.useState<string>("");
  const [loadingModel, setLoadingModel] = React.useState<boolean>(false);
  const [computing, setComputing] = React.useState<boolean>(false);
  const [results, setResults] = React.useState<string[]>([]);

  const extractorRef = React.useRef<any>(null);

  // Load model once
  React.useEffect(() => {
    const init = async () => {
      try {
        setLoadingModel(true);
        toast.info("Loading embedding model… (first load can take ~30s)");
        const device = (navigator as any).gpu ? "webgpu" : "wasm";
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

  // Auto-load Excel from public folder
  React.useEffect(() => {
    const loadExcel = async () => {
      try {
        const res = await fetch(EXCEL_PATH);
        if (!res.ok) throw new Error(`Excel not found at ${EXCEL_PATH}`);
        const buf = await res.arrayBuffer();
        const wb = XLSX.read(buf, { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json<Record<string, any>>(ws, { defval: "" });
        const haupt = rows.filter(r => String(r["Prozessart"]).trim() === "Hauptprozess");
        const names = haupt.map(r => String(r["Prozessname"]).trim()).filter(Boolean);
        const ids = haupt.map(r => r["Prozessnummer"]).filter((v: any) => v !== undefined && v !== null);
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

  // Auto precompute embeddings when model and data are ready
  React.useEffect(() => {
    const go = async () => {
      if (!extractorRef.current || !processNames.length || embeddings) return;
      try {
        setComputing(true);
        toast.info("Computing embeddings for Hauptprozesse…");
        const output: any = await extractorRef.current(processNames, { pooling: "mean", normalize: true });
        const matrix: number[][] = (output.tolist ? output.tolist() : output) as number[][];
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
      const qOut: any = await extractorRef.current(query, { pooling: "mean", normalize: true });
      const qVec: number[] = (qOut.tolist ? qOut.tolist()[0] : qOut[0]) as number[];
      const sims = embeddings.map(vec => cosineSimilarity(qVec, vec));
      const filteredIds = processIds
        .map((pid, i) => ({ pid, sim: sims[i] }))
        .filter(x => (x.sim ?? -1) >= THRESHOLD)
        .map(x => String(parseInt(String(x.pid as any), 10)))
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

  const onSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    void runSearch();
  };

  const disabled = loadingModel || computing;

  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* Ambient brand gradient */}
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-30">
        <div className="bg-gradient-primary blur-3xl h-[40rem] w-[40rem] rounded-full mx-auto mt-[-10rem]" />
      </div>

      <section className="container py-16 max-w-4xl">
        <header className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-balance">
            Bitte geben Sie Ihr Anliegen ein
          </h1>
        </header>

        <Card className="elevated">
          <CardHeader>
          </CardHeader>
          <CardContent className="space-y-6">

            <form className="grid gap-3" onSubmit={onSubmit}>
              <Input
                placeholder="z. B. Ich möchte eine Maschine mit einem Etikett versehen."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="bg-white border border-black p-3 rounded-lg shadow text-black"
              />
              <div>
                <Button type="submit" variant="hero" disabled={disabled} className="bg-violet-600 text-white hover:bg-violet-700 focus:ring focus:ring-violet-300">
                  Enter
                </Button>
              </div>
            </form>

            <div className="grid gap-2">
              <h2 className="text-lg font-semibold">Matched Hauptprozesse (IDs)</h2>
              {!results.length ? (
                <p className="text-sm text-muted-foreground">No matches yet. Try the example query above.</p>
              ) : (
                <ul className="flex flex-wrap gap-2">
                  {results.map((id, idx) => (
                    <li key={idx} className="px-3 py-1 rounded-md bg-secondary text-secondary-foreground text-sm">
                      {id}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
};

export default Index;
