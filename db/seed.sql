-- for use in Supabase
insert into public.listings (
  slug,
  name,
  location,
  price_cents,
  price_period,
  distance_km,
  max_roommates,
  has_kitchen,
  utilities_included,
  furnished,
  room_type,
  availability_note,
  description,
  image_url,
  image_alt,
  listed_by,
  amenities,
  house_rules
)
values
  (
    'stong-residence',
    'York University Stong Residence',
    'York University campus',
    93000,
    'month',
    0.7,
    0,
    false,
    true,
    true,
    'Private room in residence',
    'Available now',
    'Stong Residence at York University offers a private room with utilities included, close campus access, and a fully furnished living space. Ideal for students who want a convenient, on-campus living experience with study areas and social spaces nearby.',
    'https://www.yorku.ca/housing/wp-content/uploads/sites/57/nggallery/stong-residence/Stong-double-2.JPG',
    'York University Stong Residence',
    'York University Housing',
    array['Air conditioning', 'Internet', 'Heating', 'Washer & Dryer', 'Cable TV'],
    array['No overnight guests', 'No cannabis', 'No pets allowed', 'Quiet hours after 11pm']
  ),
  (
    'four-winds-townhouse',
    'Four Winds Drive Shared Townhouse',
    'Four Winds Drive, North York',
    93000,
    'month',
    0.5,
    3,
    true,
    true,
    false,
    'Private room, shared bathroom',
    'Available now',
    'This Four Winds Drive shared townhouse offers a private student room a short walk from Finch West Station. It is a practical off-campus option for students who want lower rent, included utilities, and easy TTC access to York University.',
    'https://img.offcampusimages.com/ATXIVPnURVKkkviCtPHl54jeVWU=/350x440/left/top/smart/images/nxcdloif4ad1wypkavtd7hdvkmarvhwwboj5xtsci54.jpeg?p=1',
    'Four Winds Drive shared townhouse',
    'Off-campus landlord',
    array['Shared kitchen', 'Backyard space', 'Nearby grocery stores', 'Transit-friendly location', 'Furnished common areas'],
    array['Male tenants only', 'No smoking indoors', 'No pets allowed', 'Quiet hours after 10:30pm']
  ),
  (
    'the-quad-yorku',
    'The Quad YorkU',
    'York University area',
    150000,
    'month',
    0.8,
    1,
    true,
    true,
    true,
    'Suite style: 2 bed, 1 bath',
    'Contact property for availability',
    'The Quad YorkU is a modern student housing community with suite-style layouts, furnished bedrooms, and built-in kitchen amenities. It is designed for students who want a more polished apartment-style experience close to campus.',
    'https://cdnarchitect.s3.ca-central-1.amazonaws.com/2019/08/29112408/BPARKQUAD02NicolasBaier.jpg',
    'The Quad YorkU',
    'The Quad YorkU',
    array['Fitness centre', 'Study spaces', 'Games lounge', 'Secure building access', 'Package lockers'],
    array['Guest policy applies', 'No smoking indoors', 'Pets subject to management approval', 'Quiet hours after 11pm']
  )
on conflict (slug) do update
set
  name = excluded.name,
  location = excluded.location,
  price_cents = excluded.price_cents,
  price_period = excluded.price_period,
  distance_km = excluded.distance_km,
  max_roommates = excluded.max_roommates,
  has_kitchen = excluded.has_kitchen,
  utilities_included = excluded.utilities_included,
  furnished = excluded.furnished,
  room_type = excluded.room_type,
  availability_note = excluded.availability_note,
  description = excluded.description,
  image_url = excluded.image_url,
  image_alt = excluded.image_alt,
  listed_by = excluded.listed_by,
  amenities = excluded.amenities,
  house_rules = excluded.house_rules;

insert into public.reviews (listing_id, author_name, rating, comment)
select listings.id, reviews.author_name, reviews.rating, reviews.comment
from (
  values
    ('stong-residence', 'Jasmine', 5, 'Excellent campus location and everything was included. Very comfortable for the semester.'),
    ('stong-residence', 'Omar', 4, 'Great value and utilities included, though the building can be busy during move-in.'),
    ('four-winds-townhouse', 'Ali', 4, 'Very convenient for getting to campus and the rent was fair for the area. The house was simple but clean.'),
    ('four-winds-townhouse', 'Hamza', 4, 'Good option if you want something off campus near transit. Shared bathroom setup takes some coordination.'),
    ('the-quad-yorku', 'Sofia', 5, 'The building feels modern and the furnished suite setup made move-in much easier than a regular rental.'),
    ('the-quad-yorku', 'Daniel', 4, 'Great amenities and nice common spaces. It is pricier, but the apartment-style layout is a big plus.')
) as reviews(slug, author_name, rating, comment)
join public.listings on listings.slug = reviews.slug;