-- Adicionar policy para permitir inserção durante o registro
CREATE POLICY "Users can insert their own profile during registration" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);