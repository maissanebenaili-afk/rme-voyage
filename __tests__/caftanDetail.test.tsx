import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CAFTANS } from '@/lib/caftans';
import CaftanGallery from '@/components/caftan/CaftanGallery';
import CaftanBooking from '@/components/caftan/CaftanBooking';
import CaftanMarketplace from '@/components/caftan/CaftanMarketplace';

const zahia = CAFTANS[0];

describe('galerie du modèle', () => {
  it('change de vue quand on clique une vignette', async () => {
    render(<CaftanGallery caftan={zahia} />);

    const face = screen.getByRole('tab', { name: 'Face' });
    const dos = screen.getByRole('tab', { name: 'Dos' });
    expect(face.getAttribute('aria-selected')).toBe('true');

    fireEvent.click(dos);
    await waitFor(() => {
      expect(dos.getAttribute('aria-selected')).toBe('true');
      expect(face.getAttribute('aria-selected')).toBe('false');
    }, { timeout: 500 });
  });
});

describe('réservation du modèle', () => {
  it("compose un lien WhatsApp avec le modèle, le mode, la taille et l'URL de la page", () => {
    render(<CaftanBooking caftan={zahia} />);

    fireEvent.click(screen.getByRole('button', { name: 'M' }));

    const cta = screen.getByRole('link', { name: /Vérifier mes dates/i });
    const href = decodeURIComponent(cta.getAttribute('href') ?? '');
    expect(href).toContain('wa.me/');
    expect(href).toContain(`Caftan ${zahia.name}`);
    expect(href).toContain('location');
    expect(href).toContain('taille M');
    expect(href).toContain(`/marwa-caftan/${zahia.id}`);
  });

  it('désactive les tailles qui ne sont pas au catalogue', () => {
    render(<CaftanBooking caftan={zahia} />);
    // Zahia existe en S, M, L — donc pas en XS.
    expect((screen.getByRole('button', { name: 'XS' }) as HTMLButtonElement).disabled).toBe(true);
    expect((screen.getByRole('button', { name: 'M' }) as HTMLButtonElement).disabled).toBe(false);
  });
});

describe('dépôt communautaire', () => {
  it('garde le bouton inactif tant que les champs requis sont vides', () => {
    render(<CaftanMarketplace />);
    const cta = screen.getByRole('button', { name: /Remplissez/i }) as HTMLButtonElement;
    expect(cta.disabled).toBe(true);
    // Rien à envoyer tant que le formulaire est incomplet.
    expect(screen.queryByRole('link', { name: /Envoyer mon annonce/i })).toBeNull();
  });

  it('compose un lien WhatsApp une fois le formulaire rempli', () => {
    render(<CaftanMarketplace />);

    fireEvent.change(screen.getByLabelText('Votre caftan'), { target: { value: 'Takchita bleu nuit' } });
    fireEvent.change(screen.getByLabelText('Taille'), { target: { value: 'M' } });
    fireEvent.change(screen.getByLabelText('État'), { target: { value: 'Bon état' } });
    fireEvent.change(screen.getByLabelText('Ville'), { target: { value: 'Lyon' } });

    const cta = screen.getByRole('link', { name: /Envoyer mon annonce/i });
    const href = decodeURIComponent(cta.getAttribute('href') ?? '');
    expect(href).toContain('wa.me/');
    expect(href).toContain('Takchita bleu nuit');
    expect(href).toContain('Location');
    expect(href).toContain('Lyon');
  });
});
