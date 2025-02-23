import { animate, style, transition, trigger } from '@angular/animations';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-event-registration',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './event-registration.component.html',
  styleUrls: ['./event-registration.component.css'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-10px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
    ]),
  ],
})
export class EventRegistrationComponent {
  eventForm: FormGroup;
  totalCost: number = 0;

  constructor(private fb: FormBuilder) {
    this.eventForm = this.fb.group({
      type: ['individual', Validators.required], // Opción de registro
      children_0_4: [0, [Validators.min(0)]], // Cantidad de hijos 0 a 4 años
      children_5_9: [0, [Validators.min(0)]], // Cantidad de hijos 5 a 9 años
      children_10_plus: [0, [Validators.min(0)]], // Cantidad de hijos 10+
      whatsappNumber: ['', [Validators.required, Validators.pattern(/^\d{10,15}$/)]], // Número de WhatsApp con validación
    });

    // Escuchar cambios en el formulario para actualizar el precio en tiempo real
    this.eventForm.valueChanges.subscribe(() => {
      this.calculateTotalCost();
    });

    this.calculateTotalCost();
  }

  calculateTotalCost(): void {
    const type = this.eventForm.get('type')?.value;
    let total = 0;

    if (type === 'individual') {
      total = 35000;
    } else if (type === 'married_no_kids') {
      total = 30000 * 2; // 2 adultos sin hijos
    } else if (type === 'married_with_kids') {
      total = 25000 * 2; // 2 adultos con hijos

      const children_5_9 = this.eventForm.get('children_5_9')?.value || 0;
      const children_10_plus = this.eventForm.get('children_10_plus')?.value || 0;

      total += children_5_9 * 12500;
      total += children_10_plus * 25000;
    }

    this.totalCost = total;
  }

  sendWhatsApp(): void {
    const type = this.eventForm.get('type')?.value;
    const whatsappNumber = this.eventForm.get('whatsappNumber')?.value;

    // Validar que el número de WhatsApp sea correcto
    if (!whatsappNumber || !/^\d{10,15}$/.test(whatsappNumber)) {
      alert('Por favor, ingresa un número de WhatsApp válido.');
      return;
    }

    let message = `Carnaval IEPE 2025 (3 y 4 de Marzo).\n`;
    
    if (type === 'individual') {
      message += `- Opción: Individual\n`;
      message += `- Total: $${this.totalCost}`;
    } else if (type === 'married_no_kids') {
      message += `- Opción: Matrimonio sin hijos\n`;
      message += `- Total: $${this.totalCost}`;
    } else if (type === 'married_with_kids') {
      message += `- Opción: Matrimonio con hijos\n`;
      message += `- Total: $${this.totalCost}\n`;
      message += `- Hijos:\n`;

      message += `  - 0 a 4 años: ${this.eventForm.get('children_0_4')?.value}\n`;
      message += `  - 5 a 9 años: ${this.eventForm.get('children_5_9')?.value}\n`;
      message += `  - 10+ años: ${this.eventForm.get('children_10_plus')?.value}\n`;
    }

    const encodedMessage = encodeURIComponent(message);
    const whatsappURL = `https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${encodedMessage}`;
    window.open(whatsappURL, '_blank');
  }
}
