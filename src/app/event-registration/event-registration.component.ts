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
      alert('⚠️ Por favor, ingresa un número de WhatsApp válido.');
      return;
    }

    let message = `🎉 *Carnaval IEPE 2025* 🎭\n📅 *3 y 4 de Marzo*\n\n`;

    // Agregar opción seleccionada
    if (type === 'individual') {
      message += `✅ *Opción seleccionada:* Individual\n`;
    } else if (type === 'married_no_kids') {
      message += `✅ *Opción seleccionada:* Matrimonio sin hijos\n`;
    } else if (type === 'married_with_kids') {
      message += `✅ *Opción seleccionada:* Matrimonio con hijos\n`;

      // Agregar hijos solo si tienen cantidad mayor a 0
      let hijosMessage = '';

      const children_0_4 = this.eventForm.get('children_0_4')?.value;
      const children_5_9 = this.eventForm.get('children_5_9')?.value;
      const children_10_plus = this.eventForm.get('children_10_plus')?.value;

      if (children_0_4 > 0) {
        hijosMessage += `👶 *Hijos de 0 a 4 años:* ${children_0_4}\n`;
      }
      if (children_5_9 > 0) {
        hijosMessage += `🧒 *Hijos de 5 a 9 años:* ${children_5_9}\n`;
      }
      if (children_10_plus > 0) {
        hijosMessage += `👦 *Hijos de 10+ años:* ${children_10_plus}\n`;
      }

      if (hijosMessage) {
        message += `👨‍👩‍👧‍👦 *Hijos inscritos:*\n${hijosMessage}\n`;
      }
    }

    // Agregar precio final
    if (type === 'individual') {
      message += `💰 *Precio final por persona (2 DIAS):* $${this.totalCost}\n\n`;
    }

    // Agregar precio final
    if (type === 'married_no_kids') {
      message += `💰 *Precio final por Matrimonio (2 DIAS):* $${this.totalCost}\n\n`;
    }


    // Agregar precio final
    if (type === 'married_with_kids') {
      message += `💰 *Precio final por Familia (2 DIAS):* $${this.totalCost}\n\n`;
    }


    // Recordatorio importante
    message += `⚠️ *No te olvides de anotarte con la hermana Graciela Muñoz* 🙏\n\n`;

    // Mensaje final con bendición
    message += `✨ *Te esperamos! Dios te bendiga.* 🙌🎊`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappURL = `https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${encodedMessage}`;
    window.open(whatsappURL, '_blank');
  }
}