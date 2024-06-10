import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
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

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ReactiveFormsModule, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  isSubmitted: boolean = false;
  verityForm = new FormGroup({
    insideLeft: new FormControl('', Validators.required),
    insideMiddle: new FormControl('', Validators.required),
    insideRight: new FormControl('', Validators.required),
    outsideLeft: new FormControl('', Validators.required),
    outsideMiddle: new FormControl('', Validators.required),
    outsideRight: new FormControl('', Validators.required),
  });

  endingShapes: any = null;
  dissectShapes: any = null;

  reset() {
    this.isSubmitted = false;
    this.endingShapes = null;
    this.dissectShapes = null;
    this.verityForm.reset();
  }

  doTheThing() {
    this.isSubmitted = true;
    this.verityForm.markAllAsTouched();
    if (this.verityForm.valid) {
      const input = this.verityForm.value;
      const startingShapes = {
        left: input.outsideLeft as Shape,
        middle: input.outsideMiddle as Shape,
        right: input.outsideRight as Shape,
      };
      this.endingShapes = {
        left: this.findEndShape(input.insideLeft as Shape),
        middle: this.findEndShape(input.insideMiddle as Shape),
        right: this.findEndShape(input.insideRight as Shape),
      };
      this.dissectShapes = this.calcDissection(
        startingShapes,
        this.endingShapes
      );
    }
  }

  findEndShape(shape: Shape) {
    switch (shape) {
      case Shape.Circle:
        return Shape.Prism;
      case Shape.Square:
        return Shape.Cone;
      case Shape.Triangle:
        return Shape.Cylinder;
      default:
        return '';
    }
  }

  calcDissection(startingShapes: any, endingShapes: any) {
    const startingCodes = {
      left: this.mapShapeToCode(startingShapes.left),
      middle: this.mapShapeToCode(startingShapes.middle),
      right: this.mapShapeToCode(startingShapes.right),
    };
    const endingCodes = {
      left: this.mapShapeToCode(endingShapes.left),
      middle: this.mapShapeToCode(endingShapes.middle),
      right: this.mapShapeToCode(endingShapes.right),
    };
    let dissectLeft: Shape[] = [];
    let dissectMiddle: Shape[] = [];
    let dissectRight: Shape[] = [];

    // Calc Left
    if (startingShapes.left !== endingShapes.left) {
      dissectLeft = this.calcDissectionShape(
        startingCodes.left,
        endingCodes.left
      );
    }

    // Calc Middle
    if (startingShapes.middle !== endingShapes.middle) {
      dissectMiddle = this.calcDissectionShape(
        startingCodes.middle,
        endingCodes.middle
      );
    }

    // Calc Right
    if (startingShapes.right !== endingShapes.right) {
      dissectRight = this.calcDissectionShape(
        startingCodes.right,
        endingCodes.right
      );
    }
    return {
      left: dissectLeft,
      middle: dissectMiddle,
      right: dissectRight,
    };
  }

  mapShapeToCode(shape: Shape): Shape[] {
    switch (shape) {
      case Shape.Sphere:
        return [Shape.Circle, Shape.Circle];
      case Shape.Pyramid:
        return [Shape.Triangle, Shape.Triangle];
      case Shape.Cube:
        return [Shape.Square, Shape.Square];
      case Shape.Cone:
        return [Shape.Circle, Shape.Triangle];
      case Shape.Prism:
        return [Shape.Square, Shape.Triangle];
      case Shape.Cylinder:
        return [Shape.Circle, Shape.Square];
      default:
        return [];
    }
  }

  calcDissectionShape(startingCode: Shape[], endingCode: Shape[]): Shape[] {
    let dissectionShapes: Shape[] = [];
    if (
      startingCode[0] !== endingCode[0] &&
      startingCode[0] !== endingCode[1]
    ) {
      dissectionShapes.push(startingCode[0]);
    }
    if (
      startingCode[1] !== endingCode[0] &&
      startingCode[1] !== endingCode[1]
    ) {
      dissectionShapes.push(startingCode[1]);
    }

    return dissectionShapes;
  }
}
