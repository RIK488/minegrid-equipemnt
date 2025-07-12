import { createClient } from '@supabase/supabase-js';
const supabaseUrl = 'https://gvbtydxkvuwrxawkxiyv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd2YnR5ZHhrdnV3cnhhd2t4aXl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYxMDI1NzEsImV4cCI6MjA2MTY3ODU3MX0.enIdGmkbRT9yKWAMemUkUkdUr9uDxefdtAWNd-B_V7g';
const supabase = createClient(supabaseUrl, supabaseKey);
export default supabase; // 👈 export par défaut ici
