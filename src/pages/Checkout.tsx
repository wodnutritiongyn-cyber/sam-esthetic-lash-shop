import { useState } from 'react';
import { ArrowLeft, MessageCircle, ShieldCheck, CreditCard, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { supabase } from '@/integrations/supabase/client';
import { z } from 'zod';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import { toast } from 'sonner';

const checkoutSchema = z.object({
  name: z.string().trim().min(2, 'Nome muito curto').max(100),
  phone: z.string().trim().min(10, 'Telefone inválido').max(20),
  address: z.string().trim().min(5, 'Endereço muito curto').max(300),
  notes: z.string().max(500).optional(),
});

const WHATSAPP_NUMBER = '5562998755213';

const Checkout = () => {
  const navigate = useNavigate();
  const { items, totalPrice, clearCart } = useCart();
  const [form, setForm] = useState({ name: '', phone: '', address: '', notes: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loadingMP, setLoadingMP] = useState(false);

  if (items.length === 0) {
    navigate('/carrinho');
    return null;
  }

  const validate = () => {
    const result = checkoutSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach(e => {
        if (e.path[0]) fieldErrors[e.path[0] as string] = e.message;
      });
      setErrors(fieldErrors);
      return null;
    }
    setErrors({});
    return result.data;
  };

  const handleWhatsApp = () => {
    const data = validate();
    if (!data) return;

    const itemsList = items
      .map(i => `▪️ ${i.quantity}x ${i.product.name} — R$ ${(i.product.price * i.quantity).toFixed(2)}`)
      .join('\n');

    const message = `🛍️ *NOVO PEDIDO — Sam Esthetic*\n\n` +
      `*Cliente:* ${data.name}\n` +
      `*Telefone:* ${data.phone}\n` +
      `*Endereço:* ${data.address}\n` +
      `${data.notes ? `*Obs:* ${data.notes}\n` : ''}` +
      `\n*Itens:*\n${itemsList}\n\n` +
      `💰 *Total: R$ ${totalPrice.toFixed(2)}*`;

    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`, '_blank');

    clearCart();
    toast.success('Pedido enviado pelo WhatsApp! 🎉');
    navigate('/');
  };

  const handleMercadoPago = async () => {
    const data = validate();
    if (!data) return;

    setLoadingMP(true);
    try {
      const mpItems = items.map(i => ({
        name: i.product.name,
        quantity: i.quantity,
        price: i.product.price,
      }));

      const { data: response, error } = await supabase.functions.invoke('create-mp-preference', {
        body: {
          items: mpItems,
          customer: {
            name: data.name,
            phone: data.phone,
            address: data.address,
            notes: data.notes || '',
          },
          siteUrl: window.location.origin,
        },
      });

      if (error) throw error;

      if (response?.init_point) {
        window.location.href = response.init_point;
      } else {
        throw new Error('No payment URL returned');
      }
    } catch (err) {
      console.error('Mercado Pago error:', err);
      toast.error('Erro ao processar pagamento. Tente novamente.');
    } finally {
      setLoadingMP(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const fields = [
    { key: 'name', label: 'Nome completo', placeholder: 'Seu nome', icon: '👤' },
    { key: 'phone', label: 'Telefone / WhatsApp', placeholder: '(00) 00000-0000', icon: '📱' },
    { key: 'address', label: 'Endereço de entrega', placeholder: 'Rua, número, bairro, cidade', icon: '📍' },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header />

      <div className="px-4 mt-4 animate-fade-in">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-muted-foreground mb-4 font-medium">
          <ArrowLeft size={16} /> Voltar
        </button>

        <h1 className="text-2xl font-extrabold text-foreground">Checkout</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Preencha seus dados e escolha a forma de pagamento
        </p>

        {/* Order Summary */}
        <div className="bg-card rounded-2xl border border-border/60 p-4 mt-5 shadow-card animate-fade-in-up">
          <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
            🧾 Resumo do Pedido
          </h3>
          {items.map(i => (
            <div key={i.product.id} className="flex justify-between text-sm py-1.5 border-b border-border/30 last:border-0">
              <span className="text-muted-foreground">{i.quantity}x {i.product.name}</span>
              <span className="text-foreground font-semibold">R$ {(i.product.price * i.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div className="mt-3 pt-3 border-t border-border flex justify-between items-center">
            <span className="font-bold text-foreground">Total</span>
            <span className="font-extrabold text-gradient text-xl">R$ {totalPrice.toFixed(2)}</span>
          </div>
        </div>

        {/* Form */}
        <div className="mt-6 space-y-4">
          {fields.map(({ key, label, placeholder, icon }, i) => (
            <div key={key} className="opacity-0 animate-fade-in-up" style={{ animationDelay: `${(i + 1) * 0.1}s` }}>
              <label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                <span>{icon}</span> {label}
              </label>
              <input
                type="text"
                placeholder={placeholder}
                value={form[key as keyof typeof form]}
                onChange={e => updateField(key, e.target.value)}
                className="mt-1.5 w-full bg-card rounded-xl px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground outline-none border border-border/60 focus:border-primary/40 focus:shadow-glow transition-all duration-300 font-medium"
              />
              {errors[key] && (
                <p className="text-xs text-destructive mt-1.5 font-medium animate-fade-in">{errors[key]}</p>
              )}
            </div>
          ))}
          <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
              <span>📝</span> Observações (opcional)
            </label>
            <textarea
              placeholder="Alguma observação sobre o pedido?"
              value={form.notes}
              onChange={e => updateField('notes', e.target.value)}
              rows={3}
              className="mt-1.5 w-full bg-card rounded-xl px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground outline-none border border-border/60 focus:border-primary/40 focus:shadow-glow transition-all duration-300 resize-none font-medium"
            />
          </div>
        </div>

        {/* Security badge */}
        <div className="flex items-center gap-2 mt-5 text-muted-foreground opacity-0 animate-fade-in stagger-5">
          <ShieldCheck size={14} className="text-primary" />
          <span className="text-xs font-medium">Seus dados são usados apenas para o pedido</span>
        </div>

        {/* Payment Buttons */}
        <div className="mt-5 space-y-3">
          {/* Mercado Pago */}
          <button
            onClick={handleMercadoPago}
            disabled={loadingMP}
            className="w-full bg-[#009ee3] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2.5 active:scale-[0.98] transition-all duration-200 shadow-md hover:shadow-lg hover:brightness-110 text-[15px] tracking-wide ring-1 ring-[#009ee3]/30 opacity-0 animate-fade-in-up stagger-6 disabled:opacity-60"
          >
            {loadingMP ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <CreditCard size={20} strokeWidth={2.5} />
            )}
            {loadingMP ? 'Processando...' : 'Pagar com Mercado Pago'}
          </button>

          <div className="flex items-center gap-3 opacity-0 animate-fade-in-up stagger-6">
            <div className="flex-1 h-px bg-border/60" />
            <span className="text-xs text-muted-foreground font-medium">ou</span>
            <div className="flex-1 h-px bg-border/60" />
          </div>

          {/* WhatsApp */}
          <button
            onClick={handleWhatsApp}
            className="w-full bg-[#25D366] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2.5 active:scale-[0.98] transition-all duration-200 shadow-md hover:shadow-lg hover:brightness-110 text-[15px] tracking-wide ring-1 ring-[#25D366]/30 opacity-0 animate-fade-in-up stagger-6"
          >
            <MessageCircle size={20} strokeWidth={2.5} />
            Enviar Pedido via WhatsApp
          </button>
        </div>

        <p className="text-[11px] text-muted-foreground text-center mt-4 mb-6">
          Pix, Cartão de Crédito e Boleto disponíveis via Mercado Pago
        </p>
      </div>

      <BottomNav />
    </div>
  );
};

export default Checkout;
