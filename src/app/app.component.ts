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

  insideLeft: Shape | null = null;
  insideMiddle: Shape | null = null;
  insideRight: Shape | null = null;
  outsideLeft: OutsideShape | null = null;
  outsideMiddle: OutsideShape | null = null;
  outsideRight: OutsideShape | null = null;
  startingSelections = [Shape.Circle, Shape.Square, Shape.Triangle];
  startingLocations = [Location.Left, Location.Middle, Location.Right];
  availableSelections = this.startingSelections;
  availableLocations = this.startingLocations;
  Location = Location;
  Shape = Shape;
  isSolvable: boolean = true;
  stepByStepSolution: string[] = [];
  solvedLeft: Shape[] = [];
  solvedMiddle: Shape[] = [];
  solvedRight: Shape[] = [];

  // TODO: watch for when two selections have been made
  makeSelection(selection: Shape, location: Location) {
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

  selectOutside(selection: OutsideShape, location: Location) {
    if (location === Location.Left) {
      this.outsideLeft = JSON.parse(JSON.stringify(selection));
    } else if (location === Location.Middle) {
      this.outsideMiddle = JSON.parse(JSON.stringify(selection));
    } else if (location === Location.Right) {
      this.outsideRight = JSON.parse(JSON.stringify(selection));
    }
  }

  reset() {
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
  }

  doTheThing() {
    this.isSolvable = this.checkSolvable();
    if (this.isSolvable) {
      let startLeft = this.outsideLeft?.composition;
      let startMiddle = this.outsideMiddle?.composition;
      let startRight = this.outsideRight?.composition;
      const endLeft = this.findEndShape(this.insideLeft)?.composition;
      const endMiddle = this.findEndShape(this.insideMiddle)?.composition;
      const endRight = this.findEndShape(this.insideRight)?.composition;

      // Left
      if (startLeft && endLeft) {
        if (JSON.stringify(startLeft) === JSON.stringify(endLeft)) {
          // left solved
          this.stepByStepSolution.push('Left Complete!');
          this.solvedLeft = startLeft || [];
        } else {
          let dissectShapes: Shape[] = [];
          if (startLeft) {
            // Check for dissections
            if (startLeft[0] !== endLeft[0] && startLeft[0] !== endLeft[1]) {
              dissectShapes.push(startLeft[0]);
            } else {
              this.solvedLeft.push(startLeft[0]);
            }
            if (
              startLeft[0] === startLeft[1] ||
              (startLeft[1] !== endLeft[0] && startLeft[1] !== endLeft[1])
            ) {
              dissectShapes.push(startLeft[1]);
            } else {
              this.solvedLeft.push(startLeft[1]);
            }

            // Find what's needed
            let neededShapes = endLeft.filter(
              (shape: Shape) =>
                !dissectShapes.includes(shape) &&
                !this.solvedLeft.includes(shape)
            );

            for (let i = 0; i < neededShapes.length; i++) {
              // Look for shape in middle
              if (startMiddle?.includes(neededShapes[i])) {
                this.stepByStepSolution.push(
                  `Dissect ${dissectShapes[i]} from Left`
                );
                this.stepByStepSolution.push(
                  `Dissect ${neededShapes[i]} from Middle`
                );
                let swapIndex = startMiddle.indexOf(neededShapes[i]);
                startMiddle.splice(swapIndex, 1);
                startMiddle.push(dissectShapes[i]);
                this.solvedLeft.push(neededShapes[i]);
              } else if (startRight?.includes(neededShapes[i])) {
                // Look for shape on right
                this.stepByStepSolution.push(
                  `Dissect ${dissectShapes[i]} from Left`
                );
                this.stepByStepSolution.push(
                  `Dissect ${neededShapes[i]} from Right`
                );
                let swapIndex = startRight.indexOf(neededShapes[i]);
                startRight.splice(swapIndex, 1);
                startRight.push(dissectShapes[i]);
                this.solvedLeft.push(neededShapes[i]);
              }
            }
          }
          this.stepByStepSolution.push('Left Complete!');
        }
      }

      // Middle
      if (startMiddle && endMiddle) {
        if (JSON.stringify(startMiddle) === JSON.stringify(endMiddle)) {
          // left solved
          this.stepByStepSolution.push('Middle Complete!');
          this.solvedMiddle = startMiddle || [];
        } else {
          let dissectShapes: Shape[] = [];
          if (startMiddle) {
            // Check for dissections
            if (
              startMiddle[0] !== endMiddle[0] &&
              startMiddle[0] !== endMiddle[1]
            ) {
              dissectShapes.push(startMiddle[0]);
            } else {
              this.solvedMiddle.push(startMiddle[0]);
            }
            if (
              startMiddle[0] === startMiddle[1] ||
              (startMiddle[1] !== endMiddle[0] &&
                startMiddle[1] !== endMiddle[1])
            ) {
              dissectShapes.push(startMiddle[1]);
            } else {
              this.solvedMiddle.push(startMiddle[1]);
            }

            // Find what's needed
            let neededShapes = endMiddle.filter(
              (shape) =>
                !dissectShapes.includes(shape) &&
                !this.solvedMiddle.includes(shape)
            );

            for (let i = 0; i < neededShapes.length; i++) {
              if (startRight?.includes(neededShapes[i])) {
                // Look for shape on right
                this.stepByStepSolution.push(
                  `Dissect ${dissectShapes[i]} from Middle`
                );
                this.stepByStepSolution.push(
                  `Dissect ${neededShapes[i]} from Right`
                );
                let swapIndex = startRight.indexOf(neededShapes[i]);
                startRight.splice(swapIndex, 1);
                startRight.push(dissectShapes[i]);
                this.solvedMiddle.push(neededShapes[i]);
              }
            }
          }
          this.stepByStepSolution.push('Middle Complete!');
        }
      }

      // Right
      this.solvedRight = startRight || [];
      this.stepByStepSolution.push('Right Complete!');
    }
  }

  checkSolvable() {
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

    return circleCount === 2 && squareCount === 2 && triangleCount === 2;
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
}
