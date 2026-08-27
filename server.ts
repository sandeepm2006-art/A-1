import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import JSZip from "jszip";
import { PYTHON_MODULES } from "./src/data/pythonFiles";
import { PRESET_SAMPLE_DATASET_CSV } from "./src/data/sampleDatasetCsv";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health API endpoint
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      service: "Cardiovascular Risk ML Pipeline API",
      version: "2.4.0"
    });
  });

  // Download individual Python module or text file
  app.get("/api/download/file/:filename", (req, res) => {
    const filename = req.params.filename;
    const moduleItem = PYTHON_MODULES.find((m) => m.filename.toLowerCase() === filename.toLowerCase());

    if (moduleItem) {
      res.setHeader("Content-Disposition", `attachment; filename="${moduleItem.filename}"`);
      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      return res.send(moduleItem.code);
    }

    if (filename.toLowerCase() === "cardiovascular_dataset_sample.csv" || filename.toLowerCase() === "dataset.csv") {
      res.setHeader("Content-Disposition", 'attachment; filename="cardiovascular_dataset_sample.csv"');
      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      return res.send(PRESET_SAMPLE_DATASET_CSV);
    }

    res.status(404).json({ error: `File '${filename}' not found in pipeline modules.` });
  });

  // Download full project ZIP bundle
  app.get("/api/download/zip", async (_req, res) => {
    try {
      const zip = new JSZip();

      PYTHON_MODULES.forEach((mod) => {
        zip.file(mod.filename, mod.code);
      });

      zip.file("cardiovascular_dataset_sample.csv", PRESET_SAMPLE_DATASET_CSV);

      const buffer = await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });
      res.setHeader("Content-Disposition", 'attachment; filename="CardioAI_Explainable_ML_Pipeline.zip"');
      res.setHeader("Content-Type", "application/zip");
      res.setHeader("Content-Length", buffer.length);
      res.end(buffer);
    } catch (err) {
      console.error("Error generating ZIP download:", err);
      res.status(500).json({ error: "Failed to generate ZIP archive." });
    }
  });

  // Download sample CSV dataset
  app.get("/api/download/dataset.csv", (_req, res) => {
    res.setHeader("Content-Disposition", 'attachment; filename="cardiovascular_dataset_sample.csv"');
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.send(PRESET_SAMPLE_DATASET_CSV);
  });

  // Export patient clinical summary report as downloadable file
  app.post("/api/export-report", (req, res) => {
    const { patientName, riskScore, category, topDrivers, params, recommendations } = req.body;
    const reportText = `===============================================================
CARDIOAI CLINICAL ML RISK ASSESSMENT REPORT
===============================================================
Generated At: ${new Date().toUTCString()}
Patient Identifier: ${patientName || "Anonymous Patient"}
Model Engine: Gradient Boosted Trees (XGBoost / LightGBM) with TreeSHAP

---------------------------------------------------------------
1. PREDICTED 10-YEAR CARDIOVASCULAR RISK
---------------------------------------------------------------
10-Year Estimated Risk: ${(riskScore || 0).toFixed(1)}%
Clinical Risk Classification: ${category || "Moderate"} Risk Tier (ACC/AHA Guideline)

---------------------------------------------------------------
2. PATIENT BIOMARKERS & CLINICAL PARAMETERS
---------------------------------------------------------------
Age: ${params?.age ?? "N/A"} years
Sex: ${params?.sex === 1 ? "Male" : "Female"}
Systolic BP: ${params?.systolicBP ?? "N/A"} mmHg
Diastolic BP: ${params?.diastolicBP ?? "N/A"} mmHg
Total Cholesterol: ${params?.totalCholesterol ?? "N/A"} mg/dL
HDL Cholesterol: ${params?.hdlCholesterol ?? "N/A"} mg/dL
LDL Cholesterol: ${params?.ldlCholesterol ?? "N/A"} mg/dL
Triglycerides: ${params?.triglycerides ?? "N/A"} mg/dL
Fasting Blood Glucose: ${params?.fastingGlucose ?? "N/A"} mg/dL
BMI: ${params?.bmi ?? "N/A"} kg/m²
Smoking Status: ${params?.smokingStatus === 1 ? `Active Smoker (${params?.cigarettesPerDay || 0} cigs/day)` : "Non-smoker"}
Diabetes Mellitus: ${params?.diabetesStatus === 1 ? "Positive (Type 2)" : "Negative"}
Resting Heart Rate: ${params?.restingHeartRate ?? "N/A"} bpm
Family History of Premature CVD: ${params?.familyHistory === 1 ? "Yes" : "No"}
Physical Activity Level: ${params?.physicalActivity ?? "Moderate"}
Anti-Hypertensive Medications: ${params?.onHypertensionMeds === 1 ? "Yes" : "No"}

---------------------------------------------------------------
3. LOCAL SHAP EXPLAINABILITY (TOP RISK DRIVERS)
---------------------------------------------------------------
${(topDrivers || []).map((d: any, idx: number) => `${idx + 1}. ${d.name}: SHAP Value = ${d.impact > 0 ? "+" : ""}${d.impact?.toFixed(3)} (${d.impact > 0 ? "Increases Risk" : "Protective Factor"})`).join("\n")}

---------------------------------------------------------------
4. EVIDENCE-BASED CLINICAL RECOMMENDATIONS
---------------------------------------------------------------
${(recommendations || []).map((r: string, idx: number) => `[${idx + 1}] ${r}`).join("\n")}

---------------------------------------------------------------
DISCLAIMER: Educational & Research Prototype. Not a medical device.
===============================================================`;

    res.setHeader("Content-Disposition", `attachment; filename="CardioRisk_Report_${(patientName || "Patient").replace(/\s+/g, "_")}.txt"`);
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.send(reportText);
  });

  // Vite middleware for development vs production static serving
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
