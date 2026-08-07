export function RegisterPaymentButton({
  onRegisterPayment,
}: Readonly<{
  onRegisterPayment: () => void;
}>) {
  return (
    <button
      type="button"
      onClick={onRegisterPayment}
      className="text-petrol hover:underline"
      title="Registrar pagamento"
    >
      registrar pagamento
    </button>
  );
}
