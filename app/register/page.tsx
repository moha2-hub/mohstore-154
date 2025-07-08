"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { register, registerWithGoogle, loginWithGoogle } from "@/app/actions/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { ArrowRight, UserPlus } from "lucide-react"
import { useTranslation } from "react-i18next"
import { LanguageToggle } from "@/components/language-toggle"
import GoogleRegisterButton from '@/components/GoogleRegisterButton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
// removed duplicate useState import

export default function RegisterPage() {
  const { t } = useTranslation("common");
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showWhatsappModal, setShowWhatsappModal] = useState(false);
  const [whatsappValue, setWhatsappValue] = useState('+');
  const [googleUser, setGoogleUser] = useState<any>(null);

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    setError(null)

    try {
      const result = await register(formData)

      if (result.success) {
        // Redirect to login page with a success message
        router.push("/login?registered=true")
      } else {
        setError(result.message || "Registration failed")
      }
    } catch (err) {
      console.error("Registration error:", err)
      setError("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="absolute top-4 right-4">
        <LanguageToggle />
      </div>
      <Card className="w-full max-w-md overflow-hidden border-none shadow-xl">
        <div className="bg-primary p-6 text-primary-foreground">
          <div className="flex items-center gap-2 text-2xl font-bold">
            <UserPlus className="h-6 w-6" />
            MOHSTORE
          </div>
          <p className="mt-2 text-sm opacity-90">{t("createAccountPrompt")}</p>
        </div>

        <CardContent className="p-6 pt-8">
          <form action={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-lg bg-red-50 p-4 text-sm text-red-500">
                <p>{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium">
                {t("username")}
              </Label>
              <Input id="username" name="username" placeholder={t("usernamePlaceholder")}
                className="h-11" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                {t("email")}
              </Label>
              <Input id="email" name="email" type="email" placeholder={t("emailPlaceholder")}
                className="h-11" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                {t("password")}
              </Label>
              <Input id="password" name="password" type="password" placeholder={t("passwordPlaceholder")}
                className="h-11" required />
              <p className="text-xs text-gray-500">{t("passwordHint")}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="whatsapp" className="text-sm font-medium">
                {t("whatsapp")}
              </Label>
              <Input
                id="whatsapp"
                name="whatsapp"
                type="tel"
                placeholder={t("whatsappPlaceholder")}
                className="h-11"
                required
                pattern="^\+[0-9]*$"
                inputMode="tel"
                onInput={e => {
                  const input = e.target as HTMLInputElement;
                  let value = input.value;
                  // Only allow leading + and numbers
                  if (value.length === 1) {
                    value = value.replace(/[^+]/g, '');
                  } else {
                    value = value.replace(/(?!^)[^0-9]/g, '');
                  }
                  if (!value.startsWith('+')) value = '+' + value.replace(/[^0-9]/g, '');
                  input.value = value;
                }}
              />
              <p className="text-xs text-gray-500">{t("whatsappHint")}</p>
            </div>

            <Button type="submit" className="h-11 w-full text-base" disabled={isLoading}>
              {isLoading ? t("creatingAccount") : t("createAccount")}
            </Button>
          </form>
          {/* WhatsApp Modal State */}
          {/**/}
          <GoogleRegisterButton onRegister={async (user) => {
            setShowWhatsappModal(true);
            setGoogleUser(user);
          }} />
          <Dialog open={showWhatsappModal} onOpenChange={setShowWhatsappModal}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('whatsappModalTitle') || 'Enter WhatsApp Number'}</DialogTitle>
              </DialogHeader>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setIsLoading(true);
                  setError(null);
                  try {
                    const res = await registerWithGoogle({
                      email: googleUser?.email,
                      displayName: googleUser?.displayName,
                      whatsapp: whatsappValue,
                    });
                    if (res.success) {
                      const loginRes = await loginWithGoogle(googleUser?.email);
                      if (loginRes.success) {
                        setShowWhatsappModal(false);
                        router.push('/customer');
                      } else {
                        setError(loginRes.message || 'Login failed');
                      }
                    } else {
                      setError(res.message || 'Registration failed');
                    }
                  } catch (err) {
                    setError('An unexpected error occurred');
                  } finally {
                    setIsLoading(false);
                  }
                }}
                className="space-y-4"
              >
                <Input
                  autoFocus
                  type="tel"
                  value={whatsappValue}
                  onChange={e => {
                    let value = e.target.value;
                    if (value.length === 1) {
                      value = value.replace(/[^+]/g, '');
                    } else {
                      value = value.replace(/(?!^)[^0-9]/g, '');
                    }
                    if (!value.startsWith('+')) value = '+' + value.replace(/[^0-9]/g, '');
                    setWhatsappValue(value);
                  }}
                  placeholder={t('whatsappPlaceholder')}
                  required
                  pattern="^\+[0-9]*$"
                  inputMode="tel"
                  className="h-11"
                />
                <DialogFooter>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? t('creatingAccount') : t('continue')}
                  </Button>
                </DialogFooter>
                {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
              </form>
            </DialogContent>
          </Dialog>
        </CardContent>

        <CardFooter className="flex justify-center border-t bg-gray-50 p-6">
          <div className="flex items-center gap-1 text-sm">
            <span className="text-gray-600">{t("alreadyHaveAccount")}</span>
            <Link href="/login" className="inline-flex items-center gap-1 font-medium text-primary hover:underline">
              {t("signIn")}
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

// Add these keys to your translation files:
// "createAccountPrompt": "Create a new account to get started",
// "username": "Username",
// "usernamePlaceholder": "johndoe",
// "emailPlaceholder": "name@example.com",
// "passwordPlaceholder": "••••••••",
// "passwordHint": "Password must be at least 8 characters long",
// "whatsapp": "WhatsApp Number",
// "whatsappPlaceholder": "+1234567890",
// "whatsappHint": "Enter your WhatsApp number with country code",
// "creatingAccount": "Creating account...",
// "createAccount": "Create Account",
// "alreadyHaveAccount": "Already have an account?",
// "signIn": "Sign in"
