import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

export enum Shape {
  Circle = 'circle',
  Square = 'square',
  Triangle = 'triangle',
  Sphere = 'sphere',
  Pyramid = 'pyramid',
  Cube = 'cube',
  Cone = 'cone',
  Prism = 'prism',
  Cylinder = 'cylinder',
}
export enum Location {
  Left = 'left',
  Middle = 'middle',
  Right = 'right',
}
export interface OutsideShape {
  name: Shape | null;
  composition: Shape[];
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  outsideShapes: OutsideShape[] = [
    { name: Shape.Sphere, composition: [Shape.Circle, Shape.Circle] },
    { name: Shape.Pyramid, composition: [Shape.Triangle, Shape.Triangle] },
    { name: Shape.Cube, composition: [Shape.Square, Shape.Square] },
    { name: Shape.Cone, composition: [Shape.Circle, Shape.Triangle] },
    { name: Shape.Prism, composition: [Shape.Square, Shape.Triangle] },
    { name: Shape.Cylinder, composition: [Shape.Circle, Shape.Square] },
  ];
  startingSelections = [Shape.Circle, Shape.Square, Shape.Triangle];
  startingLocations = [Location.Left, Location.Middle, Location.Right];
  availableOutsideShapes = this.outsideShapes;
  availableOutsideLocations = this.startingLocations;
  insideLeft: Shape | null = null;
  insideMiddle: Shape | null = null;
  insideRight: Shape | null = null;
  outsideLeft: OutsideShape | null = null;
  outsideMiddle: OutsideShape | null = null;
  outsideRight: OutsideShape | null = null;
  availableSelections = this.startingSelections;
  availableLocations = this.startingLocations;
  Location = Location;
  Shape = Shape;
  isSolvable: boolean = true;
  stepByStepSolution: string[] = [];
  solvedLeft: Shape[] = [];
  solvedMiddle: Shape[] = [];
  solvedRight: Shape[] = [];

  makeSelection(selection: Shape, location: Location): void {
    this.availableSelections = this.availableSelections.filter(
      (shape) => shape !== selection
    );
    this.availableLocations = this.availableLocations.filter(
      (availableLocation) => availableLocation !== location
    );
    if (location === Location.Left) {
      this.insideLeft = selection;
    } else if (location === Location.Middle) {
      this.insideMiddle = selection;
    } else if (location === Location.Right) {
      this.insideRight = selection;
    }

    if (this.availableLocations.length === 1) {
      this.makeSelection(
        this.availableSelections[0],
        this.availableLocations[0]
      );
    }
  }

  selectOutside(selection: OutsideShape, location: Location): void {
    this.availableOutsideLocations = this.availableOutsideLocations.filter(
      (availableOutsideLocation) => availableOutsideLocation !== location
    );

    if (location === Location.Left) {
      this.outsideLeft = JSON.parse(JSON.stringify(selection));
    } else if (location === Location.Middle) {
      this.outsideMiddle = JSON.parse(JSON.stringify(selection));
    } else if (location === Location.Right) {
      this.outsideRight = JSON.parse(JSON.stringify(selection));
    }
    if (!this.outsideLeft || !this.outsideMiddle || !this.outsideRight) {
      this.updateAvailableSelections();
    }
    if (
      this.availableOutsideLocations.length === 1 &&
      this.availableOutsideShapes.length === 1
    ) {
      this.selectOutside(
        this.availableOutsideShapes[0],
        this.availableOutsideLocations[0]
      );
    }
  }

  updateAvailableSelections() {
    const counts = this.getCounts();

    this.availableOutsideShapes = this.outsideShapes.filter((shape) => {
      let circleCount = 0;
      let squareCount = 0;
      let triangleCount = 0;
      const composition = shape.composition;

      for (let i = 0; i < composition.length; i++) {
        if (composition[i] === Shape.Circle) {
          circleCount++;
        } else if (composition[i] === Shape.Square) {
          squareCount++;
        } else if (composition[i] === Shape.Triangle) {
          triangleCount++;
        }
      }
      circleCount = circleCount + counts.circleCount;
      squareCount = squareCount + counts.squareCount;
      triangleCount = triangleCount + counts.triangleCount;

      return circleCount <= 2 && squareCount <= 2 && triangleCount <= 2;
    });
  }

  reset(): void {
    this.isSolvable = true;
    this.insideLeft = null;
    this.insideMiddle = null;
    this.insideRight = null;
    this.outsideLeft = null;
    this.outsideMiddle = null;
    this.outsideRight = null;
    this.availableSelections = this.startingSelections;
    this.availableLocations = this.startingLocations;
    this.stepByStepSolution = [];
    this.solvedLeft = [];
    this.solvedMiddle = [];
    this.solvedRight = [];
    this.availableOutsideShapes = this.outsideShapes;
    this.availableOutsideLocations = this.startingLocations;
  }

  doTheThing(): void {
    this.isSolvable = this.checkSolvable();
    if (this.isSolvable) {
      let startLeft = JSON.parse(
        JSON.stringify(this.outsideLeft?.composition || [])
      );
      let startMiddle = JSON.parse(
        JSON.stringify(this.outsideMiddle?.composition || [])
      );
      let startRight = JSON.parse(
        JSON.stringify(this.outsideRight?.composition || [])
      );
      const endLeft = this.findEndShape(this.insideLeft)?.composition || [];
      const endMiddle = this.findEndShape(this.insideMiddle)?.composition || [];
      const endRight = this.findEndShape(this.insideRight)?.composition || [];

      // Check if any are solved already
      this.solvedLeft = this.checkSolved(startLeft, endLeft, Location.Left);
      this.solvedMiddle = this.checkSolved(
        startMiddle,
        endMiddle,
        Location.Middle
      );
      this.solvedRight = this.checkSolved(startRight, endRight, Location.Right);

      // Solve Left
      if (this.solvedLeft.length !== 2 && startLeft && endLeft) {
        let dissectShapes: Shape[] = [];
        // Check for dissections
        if (startLeft[0] !== endLeft[0] && startLeft[0] !== endLeft[1]) {
          dissectShapes.push(startLeft[0]);
        }
        if (
          startLeft[0] === startLeft[1] ||
          (startLeft[1] !== endLeft[0] && startLeft[1] !== endLeft[1])
        ) {
          dissectShapes.push(startLeft[1]);
        }

        // Find what's needed
        let neededShapes = endLeft.filter(
          (shape: Shape) =>
            !dissectShapes.includes(shape) && !startLeft.includes(shape)
        );

        // Perform swaps
        for (let i = 0; i < neededShapes.length; i++) {
          // Look for shape in middle
          if (
            this.solvedMiddle.length !== 2 &&
            startMiddle?.includes(neededShapes[i])
          ) {
            this.stepByStepSolution.push(
              `Dissect ${this.toTitleCase(dissectShapes[i])} from Left`
            );
            this.stepByStepSolution.push(
              `Dissect ${this.toTitleCase(neededShapes[i])} from Middle`
            );
            let dissectIndex = startLeft.indexOf(dissectShapes[i]);
            let swapIndex = startMiddle.indexOf(neededShapes[i]);
            startLeft.splice(dissectIndex, 1);
            startMiddle.splice(swapIndex, 1);
            startLeft.push(neededShapes[i]);
            startMiddle.push(dissectShapes[i]);

            // Check solved
            this.solvedLeft = this.checkSolved(
              startLeft,
              endLeft,
              Location.Left
            );
            this.solvedMiddle = this.checkSolved(
              startMiddle,
              endMiddle,
              Location.Middle
            );
          } else if (
            this.solvedRight.length !== 2 &&
            startRight?.includes(neededShapes[i])
          ) {
            // Look for shape on right
            this.stepByStepSolution.push(
              `Dissect ${this.toTitleCase(dissectShapes[i])} from Left`
            );
            this.stepByStepSolution.push(
              `Dissect ${this.toTitleCase(neededShapes[i])} from Right`
            );
            let dissectIndex = startLeft.indexOf(dissectShapes[i]);
            let swapIndex = startRight.indexOf(neededShapes[i]);
            startLeft.splice(dissectIndex, 1);
            startRight.splice(swapIndex, 1);
            startLeft.push(neededShapes[i]);
            startRight.push(dissectShapes[i]);

            this.solvedLeft = this.checkSolved(
              startLeft,
              endLeft,
              Location.Left
            );
            this.solvedRight = this.checkSolved(
              startRight,
              endRight,
              Location.Right
            );
          }
        }
      }

      // Middle
      if (this.solvedMiddle.length !== 2 && startMiddle && endMiddle) {
        let dissectShapes: Shape[] = [];
        // Check for dissections
        if (
          startMiddle[0] !== endMiddle[0] &&
          startMiddle[0] !== endMiddle[1]
        ) {
          dissectShapes.push(startMiddle[0]);
        }
        if (
          startMiddle[0] === startMiddle[1] ||
          (startMiddle[1] !== endMiddle[0] && startMiddle[1] !== endMiddle[1])
        ) {
          dissectShapes.push(startMiddle[1]);
        }

        // Find what's needed
        let neededShapes = endMiddle.filter(
          (shape) =>
            !dissectShapes.includes(shape) && !startMiddle.includes(shape)
        );

        for (let i = 0; i < neededShapes.length; i++) {
          if (
            this.solvedRight.length !== 2 &&
            startRight?.includes(neededShapes[i])
          ) {
            // Look for shape on right
            this.stepByStepSolution.push(
              `Dissect ${this.toTitleCase(dissectShapes[i])} from Middle`
            );
            this.stepByStepSolution.push(
              `Dissect ${this.toTitleCase(neededShapes[i])} from Right`
            );
            let dissectIndex = startMiddle.indexOf(dissectShapes[i]);
            let swapIndex = startRight.indexOf(neededShapes[i]);
            startMiddle.splice(dissectIndex, 1);
            startRight.splice(swapIndex, 1);
            startMiddle.push(neededShapes[i]);
            startRight.push(dissectShapes[i]);

            // Check solved after each swap
            this.solvedMiddle = this.checkSolved(
              startMiddle,
              endMiddle,
              Location.Middle
            );
            this.solvedRight = this.checkSolved(
              startRight,
              endRight,
              Location.Right
            );
          }
        }
      }
    }
  }

  checkSolved(start: Shape[], end: Shape[], location: Location): Shape[] {
    if (JSON.stringify(start?.sort()) === JSON.stringify(end?.sort())) {
      this.stepByStepSolution.push(`${this.toTitleCase(location)} Complete!`);
      return start.sort();
    }
    return [];
  }

  getCounts() {
    let circleCount = 0;
    let squareCount = 0;
    let triangleCount = 0;

    if (this.outsideLeft) {
      for (let i = 0; i < this.outsideLeft.composition.length; i++) {
        const shape = this.outsideLeft.composition[i];
        if (shape === Shape.Circle) {
          circleCount++;
        } else if (shape === Shape.Square) {
          squareCount++;
        } else if (shape === Shape.Triangle) {
          triangleCount++;
        }
      }
    }

    if (this.outsideMiddle) {
      for (let i = 0; i < this.outsideMiddle.composition.length; i++) {
        const shape = this.outsideMiddle.composition[i];
        if (shape === Shape.Circle) {
          circleCount++;
        } else if (shape === Shape.Square) {
          squareCount++;
        } else if (shape === Shape.Triangle) {
          triangleCount++;
        }
      }
    }

    if (this.outsideRight) {
      for (let i = 0; i < this.outsideRight.composition.length; i++) {
        const shape = this.outsideRight.composition[i];
        if (shape === Shape.Circle) {
          circleCount++;
        } else if (shape === Shape.Square) {
          squareCount++;
        } else if (shape === Shape.Triangle) {
          triangleCount++;
        }
      }
    }
    return { circleCount, squareCount, triangleCount };
  }

  checkSolvable(): boolean {
    const counts = this.getCounts();

    return (
      counts.circleCount === 2 &&
      counts.squareCount === 2 &&
      counts.triangleCount === 2
    );
  }

  findEndShape(shape: Shape | null): OutsideShape | null {
    switch (shape) {
      case Shape.Circle:
        return {
          name: Shape.Prism,
          composition: [Shape.Square, Shape.Triangle],
        };
      case Shape.Square:
        return {
          name: Shape.Cone,
          composition: [Shape.Circle, Shape.Triangle],
        };
      case Shape.Triangle:
        return {
          name: Shape.Cylinder,
          composition: [Shape.Circle, Shape.Square],
        };
      default:
        return null;
    }
  }

  toTitleCase(val: string): string {
    return val.charAt(0).toUpperCase() + val.substring(1);
  }
}
