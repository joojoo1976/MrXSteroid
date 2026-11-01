import {
  SHBGInputSchema,
  SHBGResultSchema,
  type SHBGInput,
  type SHBGResult,
} from '../schemas/tool-015-shbg-modulator';

const NG_DL_TO_NMOL_L = 0.0347;
const ALBUMIN_MOLECULAR_WEIGHT_G_MOL = 66_500;
const ALBUMIN_ASSOCIATION_CONSTANT_L_MOL = 36_000;
const SHBG_ASSOCIATION_CONSTANT_L_MOL = 1_000_000_000;

/**
 * Calculate free and bioavailable testosterone using the Vermeulen
 * mass-action quadratic. This produces a calculation only; it does not
 * classify results or provide clinical interpretation or treatment advice.
 */
export function calculateSHBG(rawInput: SHBGInput): SHBGResult {
  const input = SHBGInputSchema.parse(rawInput);
  const totalT = input.total_testosterone_ng_dL * NG_DL_TO_NMOL_L * 1e-9;
  const shbg = input.shbg_nmol_L * 1e-9;
  const albuminGPerL = input.albumin_g_dL * 10;
  const albumin = albuminGPerL / ALBUMIN_MOLECULAR_WEIGHT_G_MOL;

  const albuminBindingFactor = 1 + ALBUMIN_ASSOCIATION_CONSTANT_L_MOL * albumin;
  const a = SHBG_ASSOCIATION_CONSTANT_L_MOL * albuminBindingFactor;
  const b = albuminBindingFactor + SHBG_ASSOCIATION_CONSTANT_L_MOL * (shbg - totalT);
  const c = -totalT;
  const discriminant = b * b - 4 * a * c;

  if (!Number.isFinite(discriminant) || discriminant < 0 || a <= 0) {
    throw new RangeError('Input values do not produce a finite free testosterone result.');
  }

  const freeTmolL = (-b + Math.sqrt(discriminant)) / (2 * a);
  const freeTnmolL = freeTmolL * 1e9;
  const freeTngDl = freeTnmolL / NG_DL_TO_NMOL_L;
  const bioavailableTnmolL = freeTnmolL * albuminBindingFactor;
  const result = {
    status: 'CALCULATED' as const,
    formula: 'VERMEULEN_MASS_ACTION' as const,
    free_testosterone_nmol_L: freeTnmolL,
    free_testosterone_ng_dL: freeTngDl,
    free_testosterone_percentage: (freeTnmolL / (totalT * 1e9)) * 100,
    bioavailable_testosterone_nmol_L: bioavailableTnmolL,
    bioavailable_testosterone_ng_dL: bioavailableTnmolL / NG_DL_TO_NMOL_L,
    assumptions: {
      albumin_molecular_weight_g_mol: 66_500 as const,
      albumin_association_constant_L_mol: 36_000 as const,
      shbg_association_constant_L_mol: 1_000_000_000 as const,
    },
  };

  return SHBGResultSchema.parse(result);
}
