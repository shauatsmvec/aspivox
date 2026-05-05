import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Phone, MapPin, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/lib/supabase";
import { toast } from "react-hot-toast";
import { useState } from "react";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

const ContactSection = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    const { error } = await supabase
      .from('contact_submissions')
      .insert([values]);

    if (error) {
      toast.error("Failed to send message: " + error.message);
    } else {
      toast.success("Message sent! We'll get back to you soon.");
      form.reset();
    }
    setIsSubmitting(false);
  };

  return (
    <section id="contact" className="py-24 lg:py-32 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl sm:text-5xl font-bold font-display mb-4 text-foreground uppercase tracking-tight">
            Let's <span className="text-primary">Connect</span>
          </h2>
          <div className="w-24 h-1 bg-primary mx-auto rounded-full shadow-[0_0_10px_hsl(var(--primary))]" />
        </motion.div>

        <div className="grid md:grid-cols-2 gap-16 items-start">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <div className="flex items-start gap-6 group">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-500 border border-primary/10">
                <Mail className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-bold text-foreground font-display uppercase tracking-wider text-sm mb-1">Email</p>
                <a href="mailto:aaaa@gmail.com" className="text-muted-foreground hover:text-primary transition-colors text-lg font-light">aaaa@gmail.com</a>
              </div>
            </div>
            <div className="flex items-start gap-6 group">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-500 border border-primary/10">
                <Phone className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-bold text-foreground font-display uppercase tracking-wider text-sm mb-1">Phone</p>
                <a href="tel:8585858585" className="text-muted-foreground hover:text-primary transition-colors text-lg font-light">85858 58585</a>
              </div>
            </div>
            <div className="flex items-start gap-6 group">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-500 border border-primary/10">
                <MapPin className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-bold text-foreground font-display uppercase tracking-wider text-sm mb-1">Location</p>
                <p className="text-muted-foreground text-lg font-light">Tindivanam, Tamil Nadu</p>
              </div>
            </div>

            {/* Social */}
            <div className="pt-6 flex gap-6">
              <a
                href="https://www.linkedin.com/company/aspivox/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 bg-accent/10 border border-border rounded-full flex items-center justify-center text-foreground hover:bg-primary hover:border-primary hover:text-primary-foreground transition-all duration-300 shadow-lg hover:shadow-primary/20"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </a>
              <a
                href="https://www.threads.net/@aspivox_edutech"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 bg-accent/10 border border-border rounded-full flex items-center justify-center text-foreground hover:bg-primary hover:border-primary hover:text-primary-foreground transition-all duration-300 shadow-lg hover:shadow-primary/20"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.59 12c.025 3.086.718 5.496 2.057 7.164 1.432 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.96-.065-1.187.408-2.26 1.33-3.017.88-.723 2.082-1.12 3.476-1.15 1.005-.02 1.94.117 2.793.404-.08-.545-.224-1.03-.43-1.44-.486-.965-1.375-1.455-2.641-1.455h-.045c-.876.012-1.612.305-2.127.848l-1.452-1.403c.836-.872 1.98-1.346 3.31-1.37h.062c1.986 0 3.439.846 4.225 2.455.414.849.655 1.87.72 3.04.345.19.665.4.96.634 1.19.94 1.988 2.2 2.418 3.466.588 1.731.51 4.262-1.624 6.345-1.874 1.828-4.14 2.607-7.332 2.631zM11.89 13.87c-1.033.03-1.818.282-2.33.745-.453.41-.653.93-.617 1.592.048.847.478 1.485 1.242 1.844.624.293 1.39.42 2.16.375 1.07-.058 1.876-.46 2.395-1.197.382-.544.648-1.27.77-2.136-.654-.26-1.39-.403-2.197-.42-.147-.004-.288-.005-.423-.003z"/></svg>
              </a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-card backdrop-blur-sm p-10 rounded-3xl border border-border shadow-2xl"
          >
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input placeholder="Your Name" {...field} className="bg-background border-border text-foreground placeholder:text-muted-foreground h-14 rounded-xl focus:ring-violet" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input type="email" placeholder="Your Email" {...field} className="bg-background border-border text-foreground placeholder:text-muted-foreground h-14 rounded-xl focus:ring-violet" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input placeholder="Subject" {...field} className="bg-background border-border text-foreground placeholder:text-muted-foreground h-14 rounded-xl focus:ring-violet" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <textarea
                          placeholder="Your Message"
                          {...field}
                          rows={5}
                          className="flex w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet focus-visible:ring-offset-0 md:text-sm resize-none"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" size="lg" className="w-full bg-primary text-primary-foreground font-bold py-7 rounded-xl transition-all hover:scale-[1.02] active:scale-95 shadow-xl shadow-primary/20" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Sending...
                    </>
                  ) : "Send Message"}
                </Button>
              </form>
            </Form>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
