import { useState, useEffect, useMemo } from 'react';
import { Search, Grid3x3 as Grid3X3, List, Map as MapIcon, SlidersHorizontal, X } from 'lucide-react';
import { EDGE_FN_BASE } from '../lib/supabase';
import AvailabilityGrid from '../components/AvailabilityGrid';
import AvailabilityList from '../components/AvailabilityList';
import AvailabilityMap from '../components/AvailabilityMap';
import styles from './Availability.module.css';

export interface UnitData {
  building: string;
  unit: string;
  bed: string;
  bath: string;
  sqft: string;
  net: number;
  gross: string;
  concession: string;
  term: string;
  exposure: string;
  balcony: string;
  expiry: string;
  video: string;
  floorPlan: string;
  matterport: string;
  pics: string;
  tag?: string;
}

type ViewMode = 'grid' | 'list' | 'map';

export default function Availability() {
  const [units, setUnits] = useState<UnitData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [view, setView] = useState<ViewMode>(() =>
    (localStorage.getItem('aura_view') as ViewMode) || 'grid'
  );
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [bedFilter, setBedFilter] = useState('');
  const [bathFilter, setBathFilter] = useState('');
  const [neighborhoodFilter, setNeighborhoodFilter] = useState('');
  const [buildingFilter, setBuildingFilter] = useState('');
  const [exposureFilter, setExposureFilter] = useState('');
  const [balconyFilter, setBalconyFilter] = useState('');
  const [concessionFilter, setConcessionFilter] = useState('');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');

  useEffect(() => {
    fetch(`${EDGE_FN_BASE}/site-inventory`)
      .then((r) => r.json())
      .then((data) => {
        if (data.units) setUnits(data.units);
        else if (data.error) setError(data.error);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load inventory');
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    localStorage.setItem('aura_view', view);
  }, [view]);

  const neighborhoods = useMemo(() =>
    [...new Set(units.map((u) => {
      const parts = u.building.split(' - ');
      return parts.length > 1 ? parts[1] : '';
    }).filter(Boolean))].sort(),
    [units]
  );

  const buildings = useMemo(() =>
    [...new Set(units.map((u) => u.building.split(' - ')[0]))].sort(),
    [units]
  );

  const filtered = useMemo(() => {
    return units.filter((u) => {
      if (search) {
        const q = search.toLowerCase();
        const searchable = `${u.building} ${u.bed} ${u.bath} ${u.exposure} ${u.unit}`.toLowerCase();
        if (!searchable.includes(q)) return false;
      }
      if (bedFilter && u.bed !== bedFilter) return false;
      if (bathFilter && u.bath !== bathFilter) return false;
      if (neighborhoodFilter) {
        if (!u.building.toLowerCase().includes(neighborhoodFilter.toLowerCase())) return false;
      }
      if (buildingFilter) {
        if (!u.building.toLowerCase().startsWith(buildingFilter.toLowerCase())) return false;
      }
      if (exposureFilter && !u.exposure.toLowerCase().includes(exposureFilter.toLowerCase())) return false;
      if (balconyFilter === 'yes' && (!u.balcony || u.balcony.toLowerCase() === 'no' || u.balcony === '0')) return false;
      if (balconyFilter === 'no' && u.balcony && u.balcony.toLowerCase() !== 'no' && u.balcony !== '0' && u.balcony !== '') return false;
      if (concessionFilter === 'yes' && (!u.concession || u.concession === '0' || u.concession === '')) return false;
      if (priceMin && u.net < Number(priceMin)) return false;
      if (priceMax && u.net > Number(priceMax)) return false;
      return true;
    });
  }, [units, search, bedFilter, bathFilter, neighborhoodFilter, buildingFilter, exposureFilter, balconyFilter, concessionFilter, priceMin, priceMax]);

  const activeFilters = [bedFilter, bathFilter, neighborhoodFilter, buildingFilter, exposureFilter, balconyFilter, concessionFilter, priceMin, priceMax].filter(Boolean).length;

  const clearFilters = () => {
    setBedFilter(''); setBathFilter(''); setNeighborhoodFilter('');
    setBuildingFilter(''); setExposureFilter(''); setBalconyFilter('');
    setConcessionFilter(''); setPriceMin(''); setPriceMax('');
    setSearch('');
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className="container">
          <h1 className={styles.title}>Availability</h1>
          <p className={styles.subtitle}>{filtered.length} apartments available</p>
        </div>
      </div>

      <div className="container">
        <div className={styles.toolbar}>
          <div className={styles.searchWrap}>
            <Search size={16} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search by building, layout, neighborhood..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          <div className={styles.toolbarRight}>
            <button
              className={`${styles.filterBtn} ${activeFilters > 0 ? styles.filterActive : ''}`}
              onClick={() => setFiltersOpen(!filtersOpen)}
            >
              <SlidersHorizontal size={16} />
              Filters{activeFilters > 0 && ` (${activeFilters})`}
            </button>

            <div className={styles.viewToggle}>
              <button className={`${styles.viewBtn} ${view === 'grid' ? styles.viewActive : ''}`} onClick={() => setView('grid')} title="Grid view">
                <Grid3X3 size={16} />
              </button>
              <button className={`${styles.viewBtn} ${view === 'list' ? styles.viewActive : ''}`} onClick={() => setView('list')} title="List view">
                <List size={16} />
              </button>
              <button className={`${styles.viewBtn} ${view === 'map' ? styles.viewActive : ''}`} onClick={() => setView('map')} title="Map view">
                <MapIcon size={16} />
              </button>
            </div>
          </div>
        </div>

        {filtersOpen && (
          <div className={styles.filters}>
            <div className={styles.filterGrid}>
              <select value={bedFilter} onChange={(e) => setBedFilter(e.target.value)} className={styles.filterSelect}>
                <option value="">All Bedrooms</option>
                <option value="0">Studio</option>
                <option value="Convertible">Convertible</option>
                <option value="1">1 Bed</option>
                <option value="2">2 Bed</option>
                <option value="3">3 Bed</option>
                <option value="4">4 Bed</option>
              </select>
              <select value={bathFilter} onChange={(e) => setBathFilter(e.target.value)} className={styles.filterSelect}>
                <option value="">All Bathrooms</option>
                <option value="1">1 Bath</option>
                <option value="2">2 Bath</option>
                <option value="3">3 Bath</option>
              </select>
              <select value={buildingFilter} onChange={(e) => setBuildingFilter(e.target.value)} className={styles.filterSelect}>
                <option value="">All Buildings</option>
                {buildings.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
              <select value={neighborhoodFilter} onChange={(e) => setNeighborhoodFilter(e.target.value)} className={styles.filterSelect}>
                <option value="">All Neighborhoods</option>
                {neighborhoods.map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
              <select value={exposureFilter} onChange={(e) => setExposureFilter(e.target.value)} className={styles.filterSelect}>
                <option value="">All Exposures</option>
                <option value="N">North</option>
                <option value="S">South</option>
                <option value="E">East</option>
                <option value="W">West</option>
              </select>
              <select value={balconyFilter} onChange={(e) => setBalconyFilter(e.target.value)} className={styles.filterSelect}>
                <option value="">Balcony</option>
                <option value="yes">Has Balcony</option>
                <option value="no">No Balcony</option>
              </select>
              <select value={concessionFilter} onChange={(e) => setConcessionFilter(e.target.value)} className={styles.filterSelect}>
                <option value="">Concessions</option>
                <option value="yes">Has Concession / No Fee</option>
              </select>
              <div className={styles.priceRange}>
                <input type="number" placeholder="Min $" value={priceMin} onChange={(e) => setPriceMin(e.target.value)} className={styles.priceInput} />
                <span className={styles.priceDash}>—</span>
                <input type="number" placeholder="Max $" value={priceMax} onChange={(e) => setPriceMax(e.target.value)} className={styles.priceInput} />
              </div>
            </div>
            {activeFilters > 0 && (
              <button className={styles.clearBtn} onClick={clearFilters}>
                <X size={14} /> Clear all filters
              </button>
            )}
          </div>
        )}

        <div className={styles.content}>
          {loading && <div className={styles.loading}>Loading inventory...</div>}
          {error && <div className={styles.error}>{error}</div>}
          {!loading && !error && filtered.length === 0 && (
            <div className={styles.empty}>No apartments match your criteria. Try adjusting your filters.</div>
          )}
          {!loading && !error && filtered.length > 0 && (
            <>
              {view === 'grid' && <AvailabilityGrid units={filtered} />}
              {view === 'list' && <AvailabilityList units={filtered} />}
              {view === 'map' && <AvailabilityMap units={filtered} />}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
