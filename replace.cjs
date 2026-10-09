const fs = require('fs');
let code = fs.readFileSync('src/components/OrderSummary.tsx', 'utf8');

const target = `<span className="text-lg font-medium text-on-surface">Total</span>
              <span className="font-display text-4xl font-extrabold text-primary leading-none">
                {selectedPackage ? \`Bs \${calculateFinalPrice().toFixed(2)}\` : 'Bs 0.00'}
              </span>`;

const replacement = `<span className="text-lg font-medium text-on-surface">Total</span>
                <div className="text-right">
                  <span className="font-display text-4xl font-extrabold text-primary leading-none block">
                    {selectedPayment?.currency === 'VES' && exchangeRate
                      ? \`Bs \${calculateFinalPriceVES().toFixed(2)}\`
                      : \`$ \${calculateFinalPrice().toFixed(2)}\`}
                  </span>
                  {selectedPayment?.currency === 'VES' && exchangeRate && (
                    <span className="text-sm font-medium text-on-surface-variant block mt-1">
                      (Tasa: Bs {exchangeRate})
                    </span>
                  )}
                  {selectedPayment?.currency !== 'VES' && exchangeRate && (
                    <span className="text-sm font-medium text-on-surface-variant block mt-1">
                      (Equivalente: Bs {calculateFinalPriceVES().toFixed(2)})
                    </span>
                  )}
                </div>`;

code = code.replace(target, replacement);

fs.writeFileSync('src/components/OrderSummary.tsx', code);
console.log('Done');
