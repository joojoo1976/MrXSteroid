# READ-ONLY verification of the three forensic deliverables.
$ErrorActionPreference = 'Stop'
$root = 'E:\MrXSteroid-main'
$outDir = Join-Path $root 'docs/MRX Genius Cloud Unified R6.1/smarttools-comprehensive-audit-2026-11-20'

$expectedCatalogHeader = 'Tool ID,Name EN,Name AR,Slug,Category,Canonical EN Route,Canonical AR Route,Component Path,Engine Path,Pipeline Path,Schema Path,Registry Status,Implementation Status,Batch,Last Relevant Commit,Source SHA,Catalog Status,Notes'
$expectedMappingHeader = 'Historical ID,Historical Name,Current Tool ID or Slug,Mapping Classification,Evidence,Notes'

$catalogPath = Join-Path $outDir 'SMARTTOOLS-CATALOG-RECONCILIATION.csv'
$mappingPath = Join-Path $outDir '286-TO-268-SCOPE-MAPPING.csv'
$notesPath = Join-Path $outDir 'evidence-index/CATALOG-EXTRACTION-NOTES.md'
$detailPath = Join-Path $outDir 'evidence-index/universe-detail.json'

$catalogHeader = (Get-Content -LiteralPath $catalogPath -TotalCount 1 -Encoding utf8).TrimEnd("`r", "`n")
$mappingHeader = (Get-Content -LiteralPath $mappingPath -TotalCount 1 -Encoding utf8).TrimEnd("`r", "`n")
$catalog = @(Import-Csv -LiteralPath $catalogPath -Encoding utf8)
$mapping = @(Import-Csv -LiteralPath $mappingPath -Encoding utf8)
$notes = Get-Content -LiteralPath $notesPath -Raw -Encoding utf8

Write-Output ('HEAD=' + (git -C $root rev-parse HEAD).Trim())
Write-Output ('CATALOG_HEADER_MATCH=' + ($catalogHeader -eq $expectedCatalogHeader))
Write-Output ('MAPPING_HEADER_MATCH=' + ($mappingHeader -eq $expectedMappingHeader))
Write-Output ('CATALOG_DATA_ROWS=' + $catalog.Count)
Write-Output ('MAPPING_DATA_ROWS=' + $mapping.Count)
Write-Output ('NOTES_BYTES=' + (Get-Item -LiteralPath $notesPath).Length)

$allowed = @('PRESENT','LEGACY','DUPLICATE','RETIRED','PLANNED','RENAMED','MISSING_FROM_REGISTRY','UNDETERMINED')
$badClass = @($mapping | Where-Object { $allowed -notcontains $_.'Mapping Classification' })
Write-Output ('MAPPING_INVALID_CLASSIFICATIONS=' + $badClass.Count)
$mapping | Group-Object 'Mapping Classification' | Sort-Object Name | ForEach-Object { Write-Output ('CLASS_' + $_.Name + '=' + $_.Count) }

$expectedIds = @(1..286 | ForEach-Object { 'SR-{0:D3}' -f $_ })
$actualIds = @($mapping | ForEach-Object { $_.'Historical ID' })
Write-Output ('HISTORICAL_IDS_COMPLETE=' + (@(Compare-Object ($expectedIds | Sort-Object) ($actualIds | Sort-Object)).Count -eq 0))
Write-Output ('HISTORICAL_IDS_UNIQUE=' + ((@($actualIds | Select-Object -Unique)).Count -eq 286))

$badAr = @($catalog | Where-Object { $_.'Canonical AR Route' -ne ('/ar' + $_.'Canonical EN Route') })
Write-Output ('AR_ROUTE_MISMATCHES=' + $badAr.Count)
Write-Output ('AR_ROUTE_NOT_VERIFIED=' + @($catalog | Where-Object { $_.'Canonical AR Route' -eq 'NOT_VERIFIED' }).Count)
Write-Output ('NON_AR_PREFIXED_ROUTES=' + @($catalog | Where-Object { $_.'Canonical AR Route' -notlike '/ar/smarttools/*' }).Count)

$catalog | Group-Object { ($_.'Source SHA' -split ':')[0] } | Sort-Object Name | ForEach-Object { Write-Output ('SHA_KIND_' + $_.Name + '=' + $_.Count) }
Write-Output ('UNTRACKED_MARKED=' + @($catalog | Where-Object { $_.'Source SHA' -like '*UNTRACKED*' }).Count)
Write-Output ('WORKTREE_MODIFIED_PRIMARY=' + @($catalog | Where-Object { $_.Notes -like '*PRIMARY_COMPONENT_MODIFIED*' }).Count)
Write-Output ('LAST_COMMIT_UNTRACKED_OR_NOT_FOUND=' + @($catalog | Where-Object { $_.'Last Relevant Commit' -in @('UNTRACKED','NOT_FOUND') }).Count)

$catalog | Group-Object { ($_.'Implementation Status' -split ' ')[0] } | Sort-Object Name | ForEach-Object { Write-Output ('IMPL_' + $_.Name + '=' + $_.Count) }
$catalog | Group-Object { ($_.Batch -split ';')[-1] } | Sort-Object Name | ForEach-Object { Write-Output ('BATCH_TAG_' + $_.Name + '=' + $_.Count) }
Write-Output ('AUDITED_29_NOTES=' + @($catalog | Where-Object { $_.Notes -like '*AUDIT_ALREADY_COMPLETED_2026-11-19*' }).Count)
Write-Output ('REFERENCE_039_NOTES=' + @($catalog | Where-Object { $_.Notes -like '*REFERENCE_ONLY_039_NOT_AUDIT_TARGET*' }).Count)
Write-Output ('REGISTRY_ID_VARIANT_NOTES=' + @($catalog | Where-Object { $_.Notes -like '*REGISTRY_ID_VARIANT=*' }).Count)

$pipeRows = @($catalog | Where-Object { $_.'Pipeline Path' -ne 'NOT_FOUND' })
$exactPipe = @($pipeRows | Where-Object { [System.IO.Path]::GetFileName($_.'Pipeline Path') -eq ($_.Slug + '-pipeline.ts') }).Count
$fallbackPipe = @($pipeRows | Where-Object { [System.IO.Path]::GetFileName($_.'Pipeline Path') -ne ($_.Slug + '-pipeline.ts') }).Count
Write-Output ('PIPELINE_EXACT_MATCH=' + $exactPipe)
Write-Output ('PIPELINE_PREFIX_FALLBACK=' + $fallbackPipe)
Write-Output ('PIPELINE_ANY_MATCH=' + $pipeRows.Count)
Write-Output ('PIPELINE_PREFIX_FALLBACK_NOTES=' + @($catalog | Where-Object { $_.Notes -like '*PIPELINE_PREFIX_FALLBACK*' }).Count)
Write-Output ('PIPELINE_AMBIGUOUS_NOTES=' + @($catalog | Where-Object { $_.Notes -like '*PIPELINE_MATCH_AMBIGUOUS*' }).Count)
