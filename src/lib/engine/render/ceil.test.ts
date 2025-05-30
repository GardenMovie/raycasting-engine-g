import { describe, expect, it } from "vitest";
import { GenerateSettingsType, Settings } from "../settings";
import { Ceil } from "./ceil";
import { Player } from "../player";

function generateSettings(): GenerateSettingsType {
  return {
    canvas: {
      size: {
        w: 100,
        h: 100,
      },
    },
    map: [
      [1, 1, 1],
      [1, 0, 1],
      [1, 1, 1],
    ],
    minimap: {
      size: 200,
      position: {
        x: 0,
        y: 0,
      },
      zoom: 5,
    },
  };
}

describe("Function getCell", () => {
  it("should return the correct cell", () => {
    const ceil = new Ceil(new Settings(generateSettings()));
    const cell = ceil.getCell({ x: 10.5, y: 12.5 });
    expect(cell).toEqual({ x: 10, y: 12 });
  });
});

describe("Function getSideRays", () => {
  it("should return the correct rays most left and right based in the player direction", () => {
    const settings = new Settings(generateSettings());
    const player = new Player(
      {
        position: { x: 0, y: 0 },
        direction: { x: 0, y: 1 },
        rotateSpeed: 3,
        walkSpeed: 0.05,
      },
      settings
    );
    const ceil = new Ceil(settings);
    const { mostLeftRay, mostRightRay } = ceil.getSideRays(player);
    expect(mostLeftRay).toEqual({ x: -1, y: 1 });
    expect(mostRightRay).toEqual({ x: 1, y: 1 });
  });
});

describe("Function getRowVector", () => {
  it("should return the correct start point to scanline in the maximum distance (camera space)", () => {
    const settings = new Settings(generateSettings());
    const ceil = new Ceil(settings);
    const maxDistance = settings.canvasHeight / 2; // y = vanishingPoint - 1
    const rowPositionStartPoint = ceil.getRowVector({
      rowDistance: maxDistance,
      mostLeftRay: { x: -1, y: 1 },
    });
    expect(rowPositionStartPoint).toEqual({ x: -maxDistance, y: maxDistance });
  });

  it("should return the correct start point to scanline in the minimum distance (camera space)", () => {
    const settings = new Settings(generateSettings());
    const ceil = new Ceil(settings);
    const minDistance = 1; // y = 0
    const rowPositionStartPoint = ceil.getRowVector({
      rowDistance: minDistance,
      mostLeftRay: { x: -1, y: 1 },
    });
    expect(rowPositionStartPoint).toEqual({ x: -1, y: 1 });
  });
});

describe("Function getRowPosition", () => {
  it("should return the correct start point to scanline in the maximum distance (world space)", () => {
    const settings = new Settings(generateSettings());
    const player = new Player(
      {
        position: { x: 0, y: 0 },
        direction: { x: 0, y: 1 },
        rotateSpeed: 3,
        walkSpeed: 0.05,
      },
      settings
    );
    const ceil = new Ceil(settings);
    const maxDistance = settings.canvasHeight / 2; // y = vanishingPoint - 1
    const rowPositionStartPoint = ceil.getRowPosition({
      player,
      rowVector: { x: -maxDistance, y: maxDistance },
    });
    expect(rowPositionStartPoint).toEqual({ x: -maxDistance, y: -maxDistance });
  });

  it("should return the correct start point to scanline in the minimum distance (world space)", () => {
    const settings = new Settings(generateSettings());
    const player = new Player(
      {
        position: { x: 0, y: 0 },
        direction: { x: 0, y: 1 },
        rotateSpeed: 3,
        walkSpeed: 0.05,
      },
      settings
    );
    const ceil = new Ceil(settings);
    const minDistance = 1; // y = 0
    const rowPositionStartPoint = ceil.getRowPosition({
      player,
      rowVector: { x: -1, y: 1 },
    });
    expect(rowPositionStartPoint).toEqual({ x: -1, y: -1 });
  });
});

describe("Function getRowStep", () => {
  it("should return the correct step in the maximum distance ", () => {
    const settings = new Settings(generateSettings());
    const ceil = new Ceil(settings);
    const maxDistance = settings.canvasHeight / 2; // y = vanishingPoint - 1
    const rowStep = ceil.getRowStep({
      rowDistance: maxDistance,
      mostLeftRay: { x: -1, y: 1 },
      mostRightRay: { x: 1, y: 1 },
    });

    expect(rowStep).toEqual({
      x: (2 * maxDistance) / settings.canvasWidth,
      y: 0,
    });
  });

  it("should return the correct step in the minimum distance ", () => {
    const settings = new Settings(generateSettings());
    const ceil = new Ceil(settings);
    const maxDistance = 1; // y = 0
    const rowStep = ceil.getRowStep({
      rowDistance: maxDistance,
      mostLeftRay: { x: -1, y: 1 },
      mostRightRay: { x: 1, y: 1 },
    });

    expect(rowStep).toEqual({ x: 2 / settings.canvasWidth, y: 0 });
  });
});
