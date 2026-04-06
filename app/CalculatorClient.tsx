"use client";

import { useMemo, useState, useCallback, useRef } from "react";

type SavedCalculation = {
  id: string;
  createdAt: string;
  name: string;
  notes: string;
  inputs: {
    syringeLabel: string;
    vialLabel: string;
    waterLabel: string;
    doseLabel: string;
  };
  result: {
    units: number;
    concentrationMcgPerMl: number;
    doseVolumeMl: number;
  };
};

const SAVED_CALCULATIONS_STORAGE_KEY = "bare-calc:saved-calculations";

const syringeOptions = [
  { label: "0.3 ml", value: "0.3", units: 30 },
  { label: "0.5 ml", value: "0.5", units: 50 },
  { label: "1.0 ml", value: "1.0", units: 100 },
];

const vialOptions = ["5 mg", "10 mg", "15 mg", "20 mg", "30 mg", "Other"];
const waterOptions = ["1 ml", "2 ml", "3 ml", "Other"];
const doseOptionsMcg = [
  { label: "100 mcg", value: 100 },
  { label: "250 mcg", value: 250 },
  { label: "500 mcg", value: 500 },
];

const doseOptionsMg = [
  { label: "0.5 mg", value: 500 },
  { label: "1 mg", value: 1000 },
  { label: "2 mg", value: 2000 },
];

export default function CalculatorClient() {
  const [selectedSyringe, setSelectedSyringe] = useState(syringeOptions[2]);
  const [selectedVial, setSelectedVial] = useState("5 mg");
  const [selectedWater, setSelectedWater] = useState("1 ml");
  const [selectedDoseValue, setSelectedDoseValue] = useState<number | "Other">(
    1000,
  );
  const [doseUnit, setDoseUnit] = useState<"mcg" | "mg">("mg");
  const [customVial, setCustomVial] = useState("");
  const [customWater, setCustomWater] = useState("");
  const [customDose, setCustomDose] = useState("");
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [saveNotes, setSaveNotes] = useState("");
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState("");
  const [targetUnits, setTargetUnits] = useState<string>("");
  const [selectedExample, setSelectedExample] = useState<
    "retatrutide" | "tesamorelin" | "bpc" | null
  >(null);
  const isApplyingPresetRef = useRef(false);

  const doseOptions = doseUnit === "mcg" ? doseOptionsMcg : doseOptionsMg;

  // Clear target units when any input changes (keeps display in sync)
  const clearTargetUnits = useCallback(() => {
    setTargetUnits("");
  }, []);

  const clearSelectedExample = useCallback(() => {
    if (!isApplyingPresetRef.current) {
      setSelectedExample(null);
    }
  }, []);

  // Wrapped setters that clear targetUnits
  const handleVialChange = useCallback(
    (value: string) => {
      setSelectedVial(value);
      clearTargetUnits();
      clearSelectedExample();
    },
    [clearTargetUnits, clearSelectedExample],
  );

  const handleWaterChange = useCallback(
    (value: string) => {
      setSelectedWater(value);
      clearTargetUnits();
      clearSelectedExample();
    },
    [clearTargetUnits, clearSelectedExample],
  );

  const handleCustomWaterChange = useCallback(
    (value: string) => {
      setCustomWater(value);
      clearTargetUnits();
      clearSelectedExample();
    },
    [clearTargetUnits, clearSelectedExample],
  );

  const handleCustomVialChange = useCallback(
    (value: string) => {
      setCustomVial(value);
      clearTargetUnits();
      clearSelectedExample();
    },
    [clearTargetUnits, clearSelectedExample],
  );

  const handleDoseChange = useCallback(
    (value: number | "Other") => {
      setSelectedDoseValue(value);
      clearTargetUnits();
      clearSelectedExample();
    },
    [clearTargetUnits, clearSelectedExample],
  );

  const handleCustomDoseChange = useCallback(
    (value: string) => {
      setCustomDose(value);
      clearTargetUnits();
      clearSelectedExample();
    },
    [clearTargetUnits, clearSelectedExample],
  );

  const handleDoseUnitChange = useCallback(
    (unit: "mcg" | "mg") => {
      setDoseUnit(unit);
      clearTargetUnits();
      clearSelectedExample();
    },
    [clearTargetUnits, clearSelectedExample],
  );

  const handleSyringeChange = useCallback(
    (option: (typeof syringeOptions)[number]) => {
      setSelectedSyringe(option);
      clearTargetUnits();
      clearSelectedExample();
    },
    [clearTargetUnits, clearSelectedExample],
  );

  const applyRetatrutideExample = useCallback(() => {
    isApplyingPresetRef.current = true;
    handleDoseUnitChange("mg");
    handleDoseChange(2000);
    handleCustomDoseChange("");
    handleVialChange("Other");
    handleCustomVialChange("24");
    handleWaterChange("3 ml");
    handleCustomWaterChange("");
    setSelectedExample("retatrutide");
    isApplyingPresetRef.current = false;
  }, [
    handleDoseChange,
    handleDoseUnitChange,
    handleCustomDoseChange,
    handleVialChange,
    handleCustomVialChange,
    handleWaterChange,
    handleCustomWaterChange,
  ]);

  const applyTesamorelinExample = useCallback(() => {
    isApplyingPresetRef.current = true;
    handleDoseUnitChange("mg");
    handleDoseChange(2000);
    handleCustomDoseChange("");
    handleVialChange("15 mg");
    handleCustomVialChange("");
    handleWaterChange("3 ml");
    handleCustomWaterChange("");
    setSelectedExample("tesamorelin");
    isApplyingPresetRef.current = false;
  }, [
    handleDoseChange,
    handleDoseUnitChange,
    handleCustomDoseChange,
    handleVialChange,
    handleCustomVialChange,
    handleWaterChange,
    handleCustomWaterChange,
  ]);

  const applyBpcExample = useCallback(() => {
    isApplyingPresetRef.current = true;
    handleDoseUnitChange("mcg");
    handleDoseChange(500);
    handleCustomDoseChange("");
    handleVialChange("Other");
    handleCustomVialChange("10");
    handleWaterChange("2 ml");
    handleCustomWaterChange("");
    setSelectedExample("bpc");
    isApplyingPresetRef.current = false;
  }, [
    handleDoseChange,
    handleDoseUnitChange,
    handleCustomDoseChange,
    handleVialChange,
    handleCustomVialChange,
    handleWaterChange,
    handleCustomWaterChange,
  ]);

  // Calculate water needed for a given target unit value
  const handleTargetUnitsChange = useCallback(
    (unitsStr: string) => {
      setTargetUnits(unitsStr);
      clearSelectedExample();
      const units = parseFloat(unitsStr);
      if (isNaN(units) || units <= 0) return;

      // Get vial mg
      const vialMg =
        selectedVial === "Other"
          ? Number(customVial)
          : Number.parseFloat(selectedVial);

      // Get dose in mcg
      let doseMcg: number;
      if (selectedDoseValue === "Other") {
        const customValue = Number(customDose);
        doseMcg = doseUnit === "mg" ? customValue * 1000 : customValue;
      } else {
        doseMcg = selectedDoseValue;
      }

      if (!vialMg || !doseMcg || vialMg <= 0 || doseMcg <= 0) return;

      // Calculate required water: waterMl = units * vialMg * 10 / doseMcg
      const requiredWaterMl = (units * vialMg * 10) / doseMcg;

      // Round to reasonable precision
      const roundedWater = Math.round(requiredWaterMl * 1000) / 1000;

      // Check if it matches a preset option
      const matchingPreset = waterOptions.find((opt) => {
        if (opt === "Other") return false;
        const presetMl = parseFloat(opt);
        return Math.abs(presetMl - roundedWater) < 0.01;
      });

      if (matchingPreset) {
        setSelectedWater(matchingPreset);
        setCustomWater("");
      } else {
        setSelectedWater("Other");
        setCustomWater(roundedWater.toString());
      }
    },
    [
      selectedVial,
      customVial,
      selectedDoseValue,
      customDose,
      doseUnit,
      clearSelectedExample,
    ],
  );

  const scaleLabels = useMemo(() => {
    const maxUnits = selectedSyringe.units;
    const labels = [];
    for (let value = 0; value <= maxUnits; value += 10) {
      labels.push(value);
    }
    if (labels[labels.length - 1] !== maxUnits) {
      labels.push(maxUnits);
    }
    return labels;
  }, [selectedSyringe.units]);

  const scaleTicks = useMemo(() => {
    const ticks = [];
    for (let value = 0; value <= selectedSyringe.units; value += 2) {
      ticks.push({ value, isMajor: value % 10 === 0 });
    }
    return ticks;
  }, [selectedSyringe.units]);

  const computed = useMemo(() => {
    const vialMg =
      selectedVial === "Other"
        ? Number(customVial)
        : Number.parseFloat(selectedVial);
    const waterMl =
      selectedWater === "Other"
        ? Number(customWater)
        : Number.parseFloat(selectedWater);

    // Get dose in mcg - convert from mg if needed
    let doseMcg: number;
    if (selectedDoseValue === "Other") {
      const customValue = Number(customDose);
      doseMcg = doseUnit === "mg" ? customValue * 1000 : customValue;
    } else {
      // selectedDoseValue is already stored in mcg internally
      doseMcg = selectedDoseValue;
    }

    const syringeVolumeMl = Number(selectedSyringe.value);

    if (!vialMg || !waterMl || !doseMcg || !syringeVolumeMl) {
      return null;
    }

    if (vialMg <= 0 || waterMl <= 0 || doseMcg <= 0) {
      return { error: "Invalid input" };
    }

    const totalMcg = vialMg * 1000;
    const concentrationMcgPerMl = totalMcg / waterMl;
    const doseVolumeMl = doseMcg / concentrationMcgPerMl;
    const units = doseVolumeMl * 100;
    const maxUnits = syringeVolumeMl * 100;
    const unitsRounded =
      units < 10 ? Math.round(units * 2) / 2 : Math.round(units);

    return {
      vialMg,
      waterMl,
      doseMcg,
      concentrationMcgPerMl,
      doseVolumeMl,
      units,
      unitsRounded,
      maxUnits,
      exceeds: unitsRounded > maxUnits,
      tiny: unitsRounded > 0 && unitsRounded < 0.5,
    };
  }, [
    selectedVial,
    selectedWater,
    selectedDoseValue,
    doseUnit,
    selectedSyringe.value,
    customVial,
    customWater,
    customDose,
  ]);

  const layoutCardClassName =
    "rounded-[20px] border border-slate-200/80 bg-white p-2.5 shadow-[0_12px_30px_-24px_rgba(15,23,42,0.55)] sm:rounded-[22px] sm:p-4";
  const chipButtonClassName =
    "rounded-xl border px-3 py-2 text-left text-[11px] font-semibold text-slate-900 transition-all duration-200 sm:text-xs";
  const optionButtonClassName =
    "rounded-xl border px-2.5 py-2 text-xs font-semibold transition-all duration-200 sm:px-4 sm:py-2.5";
  const selectedWaterLabel =
    selectedWater === "Other"
      ? customWater
        ? `${customWater} mL`
        : "Custom mL"
      : selectedWater.replace(" ml", " mL");
  const selectedVialLabel =
    selectedVial === "Other"
      ? customVial
        ? `${customVial} mg`
        : "Custom mg"
      : selectedVial;
  const computedUnitsDisplay =
    computed && !("error" in computed) ? computed.unitsRounded : "--";
  const computedUnitsWidth =
    computed && !("error" in computed)
      ? `${
          Math.min(Math.max(computed.unitsRounded, 0), computed.maxUnits) *
          (100 / computed.maxUnits)
        }%`
      : "0%";
  const computedDoseDisplay =
    computed && !("error" in computed)
      ? doseUnit === "mg"
        ? `${(computed.doseMcg / 1000).toLocaleString(undefined, {
            maximumFractionDigits: 3,
          })} mg`
        : `${computed.doseMcg.toLocaleString()} mcg`
      : null;

  const handleOpenSaveModal = useCallback(() => {
    setSaveError("");
    setSaveSuccess("");
    setIsSaveModalOpen(true);
  }, []);

  const handleCloseSaveModal = useCallback(() => {
    setIsSaveModalOpen(false);
    setSaveError("");
    setSaveSuccess("");
  }, []);

  const handleSaveCalculation = useCallback(() => {
    if (!computed || "error" in computed) {
      setSaveError("Enter valid values before saving.");
      setSaveSuccess("");
      return;
    }

    const doseLabel =
      doseUnit === "mg"
        ? `${(computed.doseMcg / 1000).toLocaleString(undefined, {
            maximumFractionDigits: 3,
          })} mg`
        : `${computed.doseMcg.toLocaleString()} mcg`;

    const nextEntry: SavedCalculation = {
      id: `${Date.now()}`,
      createdAt: new Date().toISOString(),
      name: saveName.trim() || "Saved calculation",
      notes: saveNotes.trim(),
      inputs: {
        syringeLabel: selectedSyringe.label.replace("ml", "mL"),
        vialLabel: selectedVialLabel,
        waterLabel: selectedWaterLabel,
        doseLabel,
      },
      result: {
        units: computed.unitsRounded,
        concentrationMcgPerMl: computed.concentrationMcgPerMl,
        doseVolumeMl: computed.doseVolumeMl,
      },
    };

    try {
      const raw =
        typeof window !== "undefined"
          ? window.localStorage.getItem(SAVED_CALCULATIONS_STORAGE_KEY)
          : null;
      const existing = raw ? (JSON.parse(raw) as SavedCalculation[]) : [];
      const updated = [nextEntry, ...existing];
      window.localStorage.setItem(
        SAVED_CALCULATIONS_STORAGE_KEY,
        JSON.stringify(updated),
      );
      setSaveSuccess("Saved to this browser.");
      setSaveError("");
      setSaveName("");
      setSaveNotes("");
    } catch {
      setSaveError("Could not save right now. Please try again.");
      setSaveSuccess("");
    }
  }, [
    computed,
    doseUnit,
    saveName,
    saveNotes,
    selectedSyringe.label,
    selectedVialLabel,
    selectedWaterLabel,
  ]);

  return (
    <>
      <div className="rounded-[24px] border border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.96))] p-2 shadow-[0_24px_70px_-40px_rgba(15,23,42,0.45)] sm:rounded-[28px] sm:p-4 md:p-5">
        <div className={`${layoutCardClassName} bg-slate-50/80`}>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-cyan-700">
                Quick presets
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                Load a common setup, then fine-tune it.
              </p>
            </div>
            <p className="text-[11px] text-slate-500">Tap any preset</p>
          </div>
          <div className="-mx-1 mt-3 flex gap-2 overflow-x-auto px-1 pb-1 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 sm:pb-0">
            <button
              type="button"
              onClick={applyRetatrutideExample}
              className={`min-w-[148px] shrink-0 sm:min-w-0 sm:w-full ${chipButtonClassName} ${
                selectedExample === "retatrutide"
                  ? "border-primary/60 bg-primary/10 shadow-[0_0_0_1px_rgba(56,189,248,0.18)]"
                  : "border-slate-200 bg-white hover:border-primary/40 hover:bg-primary/5"
              }`}
            >
              Retatrutide 2 mg
              <span className="mt-1 block text-[10px] font-medium text-slate-500">
                24 mg vial · 3 mL water
              </span>
            </button>
            <button
              type="button"
              onClick={applyTesamorelinExample}
              className={`min-w-[148px] shrink-0 sm:min-w-0 sm:w-full ${chipButtonClassName} ${
                selectedExample === "tesamorelin"
                  ? "border-primary/60 bg-primary/10 shadow-[0_0_0_1px_rgba(56,189,248,0.18)]"
                  : "border-slate-200 bg-white hover:border-primary/40 hover:bg-primary/5"
              }`}
            >
              Tesamorelin 2 mg
              <span className="mt-1 block text-[10px] font-medium text-slate-500">
                15 mg vial · 3 mL water
              </span>
            </button>
            <button
              type="button"
              onClick={applyBpcExample}
              className={`min-w-[148px] shrink-0 sm:min-w-0 sm:w-full ${chipButtonClassName} ${
                selectedExample === "bpc"
                  ? "border-primary/60 bg-primary/10 shadow-[0_0_0_1px_rgba(56,189,248,0.18)]"
                  : "border-slate-200 bg-white hover:border-primary/40 hover:bg-primary/5"
              }`}
            >
              BPC 157 500 mcg
              <span className="mt-1 block text-[10px] font-medium text-slate-500">
                10 mg vial · 2 mL water
              </span>
            </button>
          </div>
        </div>

        <div className="mt-2 grid gap-2.5 md:gap-4 lg:mt-4 lg:grid-cols-[minmax(0,1fr)_392px]">
          <div className="min-w-0">
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3 md:gap-4 lg:h-full lg:auto-rows-fr lg:gap-5">
              <section className={`${layoutCardClassName} lg:h-full`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="hidden text-[11px] font-semibold uppercase tracking-[0.14em] text-cyan-700 sm:block">
                      Step 1
                    </p>
                    <h2 className="mt-1 text-sm font-semibold text-slate-900 sm:text-base">
                      Syringe
                    </h2>
                    <p className="mt-1 text-[10px] text-slate-500 sm:text-[11px]">
                      What is the total volume of your syringe?
                    </p>
                  </div>
                  <div className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-500 sm:text-[10px]">
                    U-100
                  </div>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2 sm:mt-3 sm:grid-cols-3">
                  {syringeOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleSyringeChange(option)}
                      className={`flex min-h-[72px] w-full flex-col items-start justify-between gap-1 rounded-2xl border px-2.5 py-2 text-left transition-all duration-200 sm:min-h-0 sm:gap-1.5 sm:px-4 sm:py-3 ${
                        selectedSyringe.value === option.value
                          ? "border-primary/60 bg-primary/5 shadow-[0_0_0_1px_rgba(56,189,248,0.22),0_12px_24px_-18px_rgba(56,189,248,0.55)]"
                          : "border-slate-200 bg-white hover:border-primary/40 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex w-full items-start justify-between gap-2">
                        <span className="text-[11px] font-semibold text-slate-900 sm:text-sm">
                          {option.label.replace("ml", "mL")}
                        </span>
                        {selectedSyringe.value === option.value ? (
                          <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-primary">
                            ✓
                          </span>
                        ) : null}
                      </div>
                      <span className="text-[10px] font-medium text-slate-600 sm:text-xs">
                        {option.units}u total
                      </span>
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-[10px] text-slate-500 sm:mt-3 sm:text-[11px]">
                  U-100 insulin syringes: 1 mL = 100 units.
                </p>
              </section>

              <section className={`${layoutCardClassName} lg:h-full`}>
                <p className="hidden text-[11px] font-semibold uppercase tracking-[0.14em] text-cyan-700 sm:block">
                  Step 2
                </p>
                <h3 className="mt-0.5 text-xs font-semibold text-slate-900 sm:mt-1 sm:text-sm">
                  Vial quantity
                </h3>
                <p className="mt-1 text-[10px] text-slate-500 sm:text-[11px]">
                  How many mg of peptides in your vial?
                </p>
                <div className="mt-2 grid grid-cols-2 gap-2 sm:mt-3">
                  {vialOptions.map((option) =>
                    option === "Other" && selectedVial === "Other" ? (
                      <div
                        key={option}
                        className="flex items-center gap-2 rounded-xl border border-primary/50 bg-primary/5 px-2.5 py-2 sm:px-3 sm:py-2.5"
                      >
                        <input
                          type="number"
                          inputMode="decimal"
                          min="0"
                          step="any"
                          aria-label="Custom vial quantity in milligrams"
                          value={customVial}
                          onChange={(event) =>
                            handleCustomVialChange(event.target.value)
                          }
                          placeholder="Other"
                          className="w-full bg-transparent text-xs font-semibold text-slate-900 outline-none placeholder:text-slate-400"
                        />
                        <span className="text-xs font-semibold text-slate-400">
                          mg
                        </span>
                      </div>
                    ) : (
                      <button
                        key={option}
                        type="button"
                        onClick={() => handleVialChange(option)}
                        className={`${optionButtonClassName} ${
                          selectedVial === option
                            ? "border-primary/50 bg-primary/5 text-slate-900"
                            : "border-slate-200 bg-white text-slate-900 hover:border-primary/50 hover:bg-slate-50"
                        }`}
                      >
                        {option}
                      </button>
                    ),
                  )}
                </div>
              </section>

              <section className={`${layoutCardClassName} lg:h-full`}>
                <p className="hidden text-[11px] font-semibold uppercase tracking-[0.14em] text-cyan-700 sm:block">
                  Step 3
                </p>
                <h3 className="mt-0.5 text-xs font-semibold text-slate-900 sm:mt-1 sm:text-sm">
                  BAC water
                </h3>
                <p className="mt-1 text-[10px] text-slate-500 sm:text-[11px]">
                  Bacteriostatic water used to reconstitute your vial.
                </p>
                <div className="mt-2 grid grid-cols-2 gap-2 sm:mt-3">
                  {waterOptions.map((option) =>
                    option === "Other" && selectedWater === "Other" ? (
                      <div
                        key={option}
                        className="flex items-center gap-2 rounded-xl border border-primary/50 bg-primary/5 px-2.5 py-2 sm:px-3 sm:py-2.5"
                      >
                        <input
                          type="number"
                          inputMode="decimal"
                          min="0"
                          step="any"
                          aria-label="Custom diluent volume in milliliters"
                          value={customWater}
                          onChange={(event) =>
                            handleCustomWaterChange(event.target.value)
                          }
                          placeholder="Other"
                          className="w-full bg-transparent text-xs font-semibold text-slate-900 outline-none placeholder:text-slate-400"
                        />
                        <span className="text-xs font-semibold text-slate-400">
                          mL
                        </span>
                      </div>
                    ) : (
                      <button
                        key={option}
                        type="button"
                        onClick={() => handleWaterChange(option)}
                        className={`${optionButtonClassName} ${
                          selectedWater === option
                            ? "border-primary/50 bg-primary/5 text-slate-900"
                            : "border-slate-200 bg-white text-slate-900 hover:border-primary/50 hover:bg-slate-50"
                        }`}
                      >
                        {option === "Other"
                          ? option
                          : option.replace(" ml", " mL")}
                      </button>
                    ),
                  )}
                </div>
              </section>

              <section className={`${layoutCardClassName} lg:h-full`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="hidden text-[11px] font-semibold uppercase tracking-[0.14em] text-cyan-700 sm:block">
                      Step 4
                    </p>
                    <h3 className="mt-0.5 text-sm font-semibold text-slate-900 sm:mt-1 sm:text-base">
                      Dose
                    </h3>
                    <p className="mt-1 text-[10px] text-slate-500 sm:text-[11px]">
                      How much of the peptide do you want in each dose?
                    </p>
                  </div>
                  <div
                    className="relative flex h-7 shrink-0 items-center rounded-full border border-slate-200 bg-slate-50 p-0.5"
                    role="radiogroup"
                    aria-label="Dose unit"
                  >
                    <div
                      className="absolute h-6 rounded-full bg-primary/90 shadow-sm transition-all duration-200"
                      style={{
                        width: doseUnit === "mcg" ? "42px" : "36px",
                        left: doseUnit === "mcg" ? "2px" : "calc(100% - 38px)",
                      }}
                    />
                    <button
                      type="button"
                      role="radio"
                      aria-checked={doseUnit === "mcg"}
                      onClick={() => handleDoseUnitChange("mcg")}
                      className={`relative z-10 flex h-6 w-[42px] items-center justify-center rounded-full text-[11px] font-semibold transition-colors duration-200 ${
                        doseUnit === "mcg"
                          ? "text-white"
                          : "text-slate-500 hover:text-slate-700"
                      }`}
                    >
                      mcg
                    </button>
                    <button
                      type="button"
                      role="radio"
                      aria-checked={doseUnit === "mg"}
                      onClick={() => handleDoseUnitChange("mg")}
                      className={`relative z-10 flex h-6 w-9 items-center justify-center rounded-full text-[11px] font-semibold transition-colors duration-200 ${
                        doseUnit === "mg"
                          ? "text-white"
                          : "text-slate-500 hover:text-slate-700"
                      }`}
                    >
                      mg
                    </button>
                  </div>
                </div>
                <p className="mt-2 text-[10px] text-slate-500 sm:text-[11px]">
                  1 mg = 1000 mcg
                </p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {doseOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleDoseChange(option.value)}
                      className={`${optionButtonClassName} ${
                        selectedDoseValue === option.value
                          ? "border-primary/50 bg-primary/5 text-slate-900"
                          : "border-slate-200 bg-white text-slate-900 hover:border-primary/50 hover:bg-slate-50"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                  {selectedDoseValue === "Other" ? (
                    <div className="col-span-2 flex items-center gap-2 rounded-xl border border-primary/50 bg-primary/5 px-2.5 py-2 sm:px-3 sm:py-2.5">
                      <input
                        type="number"
                        inputMode="decimal"
                        min="0"
                        step="any"
                        aria-label={`Custom target dose in ${doseUnit === "mcg" ? "micrograms" : "milligrams"}`}
                        value={customDose}
                        onChange={(event) =>
                          handleCustomDoseChange(event.target.value)
                        }
                        placeholder="Other"
                        className="w-full bg-transparent text-xs font-semibold text-slate-900 outline-none placeholder:text-slate-400"
                      />
                      <span className="text-xs font-semibold text-slate-400">
                        {doseUnit}
                      </span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleDoseChange("Other")}
                      className={`${optionButtonClassName} border-slate-200 bg-white text-slate-900 hover:border-primary/50 hover:bg-slate-50`}
                    >
                      Other
                    </button>
                  )}
                </div>
              </section>

              <details className="col-span-2 rounded-[20px] border border-slate-200/80 bg-white px-3 py-2 shadow-[0_12px_30px_-24px_rgba(15,23,42,0.55)] lg:hidden">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-cyan-700">
                      Advanced tools
                    </p>
                    <p className="mt-0.5 text-xs font-semibold text-slate-900">
                      Target units
                    </p>
                  </div>
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                    Open
                  </span>
                </summary>
                <div className="mt-3 space-y-3">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                    <label
                      htmlFor="target-units-mobile"
                      className="block text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-600"
                    >
                      Target units (optional)
                    </label>
                    <div className="mt-2 flex items-center gap-2">
                      <input
                        id="target-units-mobile"
                        type="number"
                        inputMode="decimal"
                        min="0"
                        max={selectedSyringe.units}
                        step="1"
                        value={targetUnits}
                        onChange={(event) =>
                          handleTargetUnitsChange(event.target.value)
                        }
                        placeholder={
                          computed && !("error" in computed)
                            ? computed.unitsRounded.toString()
                            : "0"
                        }
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-right text-sm font-semibold text-slate-900 outline-none transition-all placeholder:text-slate-300 focus:border-cyan-300 focus:ring-2 focus:ring-cyan-200"
                      />
                      <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                        units
                      </span>
                    </div>
                    <p className="mt-2 text-[10px] leading-4 text-slate-500">
                      {targetUnits && computed && !("error" in computed)
                        ? `Water adjusted to ${selectedWaterLabel}.`
                        : "Adjusts water to match your preferred draw."}
                    </p>
                  </div>
                </div>
              </details>

              <section className="col-span-2 rounded-[20px] border border-slate-200 bg-white px-3 py-3 text-slate-900 shadow-[0_20px_45px_-34px_rgba(15,23,42,0.28)] lg:hidden">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-700">
                      Your draw
                    </p>
                  </div>
                  <div className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-700">
                    {selectedSyringe.label.replace("ml", "mL")}
                  </div>
                </div>
                <div className="mt-2 grid grid-cols-[auto_minmax(0,1fr)] items-end gap-3">
                  <div className="flex items-end gap-1">
                    <span className="text-3xl font-semibold tracking-tight text-slate-950">
                      {computedUnitsDisplay}
                    </span>
                    <span className="pb-1 text-[11px] font-medium text-slate-500">
                      units
                    </span>
                  </div>
                  <div className="relative h-10 rounded-full bg-slate-100">
                    <div className="absolute inset-x-3 top-2.5 h-5">
                      <div
                        className="absolute bottom-0 left-0 h-[12px] rounded-sm bg-primary/80 shadow-[0_0_12px_rgba(56,189,248,0.4)] transition-all duration-300"
                        style={{ width: computedUnitsWidth }}
                      />
                      {scaleTicks.map((tick) => (
                        <div
                          key={tick.value}
                          className="absolute bottom-0"
                          style={{
                            left: `${(tick.value / selectedSyringe.units) * 100}%`,
                          }}
                        >
                          <div
                            className={`w-[1px] bg-slate-400 ${
                              tick.isMajor ? "h-4" : "h-2"
                            }`}
                          />
                        </div>
                      ))}
                    </div>
                    <div className="absolute inset-x-3 top-1 flex items-start justify-between text-[9px] font-semibold text-slate-500">
                      {scaleLabels.map((label) => (
                        <span key={label}>{label}</span>
                      ))}
                    </div>
                  </div>
                </div>
                {computed && !("error" in computed) && computedDoseDisplay ? (
                  <p className="mt-3 text-[11px] leading-5 text-slate-600">
                    To have a dose of{" "}
                    <span className="font-semibold text-slate-950">
                      {computedDoseDisplay}
                    </span>
                    , pull to {computed.unitsRounded} unit
                    {computed.unitsRounded === 1 ? "" : "s"}.
                  </p>
                ) : null}
                <div className="mt-3 grid grid-cols-3 gap-2">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-2.5 py-2">
                    <p className="text-[9px] uppercase tracking-[0.12em] text-slate-400">
                      Vial
                    </p>
                    <p className="mt-1 truncate text-[11px] font-semibold text-slate-900">
                      {selectedVialLabel}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-2.5 py-2">
                    <p className="text-[9px] uppercase tracking-[0.12em] text-slate-400">
                      Water
                    </p>
                    <p className="mt-1 truncate text-[11px] font-semibold text-slate-900">
                      {selectedWaterLabel}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-2.5 py-2">
                    <p className="text-[9px] uppercase tracking-[0.12em] text-slate-400">
                      Volume
                    </p>
                    <p className="mt-1 truncate text-[11px] font-semibold text-slate-900">
                      {computed && !("error" in computed)
                        ? `${computed.doseVolumeMl.toFixed(3)} mL`
                        : "--"}
                    </p>
                  </div>
                </div>
                {computed && "error" in computed ? (
                  <p className="mt-2 text-[10px] leading-4 text-rose-600">
                    Invalid input. Enter values greater than zero.
                  </p>
                ) : null}
                {computed && !("error" in computed) && computed.exceeds ? (
                  <p className="mt-2 text-[10px] leading-4 text-amber-700">
                    Exceeds the selected syringe range.
                  </p>
                ) : null}
                {computed && !("error" in computed) && computed.tiny ? (
                  <p className="mt-2 text-[10px] leading-4 text-slate-500">
                    Very small draw. Check dilution if needed.
                  </p>
                ) : null}
                <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                  <p className="text-[10px] font-medium leading-4 text-slate-700">
                    Save this draw so you do not need to redo the math next
                    time.
                  </p>
                  <button
                    type="button"
                    onClick={handleOpenSaveModal}
                    className="mt-2 inline-flex h-9 w-full items-center justify-center rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white transition-all duration-300 hover:bg-slate-800"
                  >
                    Save calculation
                  </button>
                </div>
              </section>
            </div>
          </div>

          <aside className="hidden min-w-0 space-y-3 lg:sticky lg:top-24 lg:block lg:self-start">
            <section className="rounded-[24px] border border-slate-200 bg-white px-5 py-5 text-slate-900 shadow-[0_24px_60px_-32px_rgba(15,23,42,0.22)]">
              <div className="flex items-start justify-between gap-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-700">
                  Your draw
                </p>
                <div className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-700">
                  {selectedSyringe.label.replace("ml", "mL")}
                </div>
              </div>
              <div className="mt-3 flex items-end gap-4">
                <div className="shrink-0">
                  <div className="text-5xl font-semibold tracking-tight text-slate-950">
                    {computedUnitsDisplay}
                    <span className="ml-2 text-sm font-medium text-slate-500">
                      units
                    </span>
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="relative h-12 rounded-full bg-slate-100">
                    <div className="absolute inset-x-4 top-3 h-6">
                      <div
                        className="absolute bottom-0 left-0 h-[15px] rounded-sm bg-primary/80 shadow-[0_0_16px_rgba(56,189,248,0.45)] transition-all duration-300"
                        style={{ width: computedUnitsWidth }}
                      />
                      {scaleTicks.map((tick) => (
                        <div
                          key={tick.value}
                          className="absolute bottom-0"
                          style={{
                            left: `${(tick.value / selectedSyringe.units) * 100}%`,
                          }}
                        >
                          <div
                            className={`w-[1px] bg-slate-400 ${
                              tick.isMajor ? "h-5" : "h-2"
                            }`}
                          />
                        </div>
                      ))}
                    </div>
                    <div className="absolute inset-x-4 top-1 flex items-start justify-between text-[10px] font-semibold text-slate-500">
                      {scaleLabels.map((label) => (
                        <span key={label}>{label}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              {computed && !("error" in computed) && computedDoseDisplay ? (
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  To have a dose of{" "}
                  <span className="font-semibold text-slate-950">
                    {computedDoseDisplay}
                  </span>
                  , pull to {computed.unitsRounded} unit
                  {computed.unitsRounded === 1 ? "" : "s"}.
                </p>
              ) : (
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Choose your syringe, vial, water, and dose to calculate the
                  draw.
                </p>
              )}

              <div className="mt-5 space-y-3 rounded-[20px] border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3 text-xs text-slate-500">
                  <span>Selected vial</span>
                  <span className="font-semibold text-slate-950">
                    {selectedVialLabel}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3 text-xs text-slate-500">
                  <span>Water</span>
                  <span className="font-semibold text-slate-950">
                    {selectedWaterLabel}
                  </span>
                </div>
                {computed && !("error" in computed) ? (
                  <>
                    <div className="flex items-center justify-between gap-3 text-xs text-slate-500">
                      <span>Concentration</span>
                      <span className="font-semibold text-slate-950">
                        {computed.concentrationMcgPerMl.toFixed(1)} mcg/mL
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3 text-xs text-slate-500">
                      <span>Dose volume</span>
                      <span className="font-semibold text-slate-950">
                        {computed.doseVolumeMl.toFixed(3)} mL
                      </span>
                    </div>
                  </>
                ) : null}
              </div>

              <div className="mt-4 rounded-[20px] border border-slate-200 bg-slate-50 p-4">
                <label
                  htmlFor="target-units"
                  className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-600"
                >
                  Target units (optional)
                </label>
                <p className="mt-1 text-xs text-slate-500">
                  Adjusts water to match your preferred draw.
                </p>
                <div className="mt-3 flex items-center gap-3">
                  <input
                    id="target-units"
                    type="number"
                    inputMode="decimal"
                    min="0"
                    max={selectedSyringe.units}
                    step="1"
                    value={targetUnits}
                    onChange={(event) =>
                      handleTargetUnitsChange(event.target.value)
                    }
                    placeholder={
                      computed && !("error" in computed)
                        ? computed.unitsRounded.toString()
                        : "0"
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-right text-base font-semibold text-slate-900 outline-none transition-all placeholder:text-slate-300 focus:border-cyan-300 focus:ring-2 focus:ring-cyan-200"
                  />
                  <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                    units
                  </span>
                </div>
                {targetUnits && computed && !("error" in computed) ? (
                  <p className="mt-3 text-xs leading-5 text-cyan-700">
                    Water adjusted to{" "}
                    <span className="font-semibold">{selectedWaterLabel}</span>{" "}
                    for {targetUnits} units.
                  </p>
                ) : null}
              </div>

              {computed && "error" in computed ? (
                <p className="mt-4 text-xs font-semibold text-rose-600">
                  Invalid input. Please enter values greater than zero.
                </p>
              ) : null}

              {computed && !("error" in computed) && computed.exceeds ? (
                <p className="mt-4 text-xs font-semibold text-amber-700">
                  Dose requires {computed.unitsRounded} units, which exceeds
                  this syringe&apos;s {computed.maxUnits}-unit range.
                </p>
              ) : null}

              {computed && !("error" in computed) && computed.tiny ? (
                <p className="mt-4 text-xs text-slate-500">
                  Very small volume. Consider adjusting dilution to make the
                  draw easier to measure.
                </p>
              ) : null}

              <div className="mt-5 rounded-[20px] border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-950">
                  Keep this draw handy
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-600">
                  Save your exact draw, vial, and water setup for quick reuse.
                </p>
                <button
                  type="button"
                  onClick={handleOpenSaveModal}
                  className="mt-3 inline-flex h-10 w-full items-center justify-center rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white transition-all duration-300 hover:bg-slate-800"
                >
                  Save calculation
                </button>
              </div>
            </section>
          </aside>
        </div>
      </div>

      {isSaveModalOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="save-calculation-title"
        >
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2
                  id="save-calculation-title"
                  className="text-lg font-semibold text-slate-950"
                >
                  Save calculation
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Saved locally in this browser.
                </p>
              </div>
              <button
                type="button"
                onClick={handleCloseSaveModal}
                className="rounded-full border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                aria-label="Close save calculation modal"
              >
                Close
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-600">
                  Name
                </span>
                <input
                  type="text"
                  value={saveName}
                  onChange={(event) => setSaveName(event.target.value)}
                  placeholder="Morning dose"
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-cyan-300 focus:ring-2 focus:ring-cyan-200"
                />
              </label>

              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-600">
                  Notes (optional)
                </span>
                <textarea
                  value={saveNotes}
                  onChange={(event) => setSaveNotes(event.target.value)}
                  placeholder="Any context for this setup"
                  rows={3}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-cyan-300 focus:ring-2 focus:ring-cyan-200"
                />
              </label>

              {saveError ? (
                <p className="text-xs font-medium text-rose-600">{saveError}</p>
              ) : null}
              {saveSuccess ? (
                <p className="text-xs font-medium text-emerald-700">
                  {saveSuccess}
                </p>
              ) : null}
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={handleCloseSaveModal}
                className="inline-flex h-9 items-center justify-center rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveCalculation}
                className="inline-flex h-9 items-center justify-center rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
