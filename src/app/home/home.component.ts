import { Component } from '@angular/core';
import { AnimalsComponent } from '../animals/animals.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [AnimalsComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent { // Update this line
}