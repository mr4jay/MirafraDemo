
import { redirect } from 'next/navigation';

export default function IDEPage() {
  redirect('/ide/data-explorer');
  return null; // redirect will interrupt rendering
}
