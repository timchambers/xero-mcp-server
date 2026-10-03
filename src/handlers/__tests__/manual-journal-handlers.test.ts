import { describe, it, expect, vi, beforeEach } from "vitest";
import { ManualJournal, ManualJournalLine } from "xero-node";

const mocks = vi.hoisted(() => ({
  authenticate: vi.fn(),
  createManualJournals: vi.fn(),
  updateManualJournal: vi.fn(),
}));

vi.mock("../../clients/xero-client.js", () => ({
  xeroClient: {
    tenantId: "tenant-1",
    authenticate: mocks.authenticate,
    accountingApi: {
      createManualJournals: mocks.createManualJournals,
      updateManualJournal: mocks.updateManualJournal,
    },
  },
}));

import { createXeroManualJournal } from "../create-xero-manual-journal.handler.js";
import { updateXeroManualJournal } from "../update-xero-manual-journal.handler.js";

const trackedLines: ManualJournalLine[] = [
  {
    lineAmount: 100,
    accountCode: "400",
    description: "Debit",
    tracking: [
      { name: "Region", option: "North", trackingCategoryID: "tc-1" },
      { name: "Department", option: "Sales", trackingCategoryID: "tc-2" },
    ],
  },
  {
    lineAmount: -100,
    accountCode: "200",
    description: "Credit",
  },
];

beforeEach(() => {
  vi.resetAllMocks();
});

describe("createXeroManualJournal", () => {
  it("sends tracking categories on journal lines", async () => {
    const created: ManualJournal = {
      manualJournalID: "mj-1",
      narration: "Tracked journal",
    };
    mocks.createManualJournals.mockResolvedValue({
      body: { manualJournals: [created] },
    });

    const response = await createXeroManualJournal(
      "Tracked journal",
      trackedLines,
    );

    expect(response.isError).toBe(false);
    expect(response.result).toEqual(created);

    const [, payload] = mocks.createManualJournals.mock.calls[0];
    const lines = payload.manualJournals[0].journalLines;
    expect(lines[0].tracking).toEqual([
      { name: "Region", option: "North", trackingCategoryID: "tc-1" },
      { name: "Department", option: "Sales", trackingCategoryID: "tc-2" },
    ]);
    expect(lines[1].tracking).toBeUndefined();
  });
});

describe("updateXeroManualJournal", () => {
  it("sends tracking categories on journal lines", async () => {
    const updated: ManualJournal = {
      manualJournalID: "mj-1",
      narration: "Tracked journal",
    };
    mocks.updateManualJournal.mockResolvedValue({
      body: { manualJournals: [updated] },
    });

    const response = await updateXeroManualJournal(
      "Tracked journal",
      "mj-1",
      trackedLines,
    );

    expect(response.isError).toBe(false);

    const [, manualJournalID, payload] =
      mocks.updateManualJournal.mock.calls[0];
    expect(manualJournalID).toBe("mj-1");
    const lines = payload.manualJournals[0].journalLines;
    expect(lines[0].tracking).toEqual([
      { name: "Region", option: "North", trackingCategoryID: "tc-1" },
      { name: "Department", option: "Sales", trackingCategoryID: "tc-2" },
    ]);
    expect(lines[1].tracking).toBeUndefined();
  });
});
