-- =====================================================================
-- Typed-answer questions ("Guess the gadget").
--
--   kind              'mcq' (tap an option, the original behaviour) or
--                     'text' (type the answer; checked server-side)
--   accepted_answers  extra spellings/names counted as correct for a
--                     'text' question. correct_option holds the main
--                     answer as shown at the reveal.
--   hint              shown under the image while answering
--   reveal_image_url  swapped in for image_url from the reveal onward
--                     (zoomed-in picture -> the whole gadget)
--
-- Purely additive: existing questions become kind = 'mcq' and behave
-- exactly as before. A typed answer is stored in answers.selected_option
-- (free text; that column never had a letter-only constraint).
-- =====================================================================

alter table public.questions
  add column if not exists kind             text   not null default 'mcq',
  add column if not exists accepted_answers text[] not null default '{}',
  add column if not exists hint             text,
  add column if not exists reveal_image_url text;

alter table public.questions drop constraint if exists questions_kind_check;
alter table public.questions
  add constraint questions_kind_check check (kind in ('mcq', 'text'));

-- Let the API see the new columns straight away.
notify pgrst, 'reload schema';
