{{/* vim: set filetype=mustache: */}}

{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
If release name contains chart name it will be used as a full name.
*/}}
{{- define "mlaas-ui.fullname" -}}
{{- if .Values.fullnameOverride -}}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- $name := default .Chart.Name .Values.nameOverride -}}
{{- if contains $name .Release.Name -}}
{{- .Release.Name | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" -}}
{{- end -}}
{{- end -}}
{{- end -}}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "mlaas-ui.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{/*
Create the name of the service account to use
*/}}
{{- define "mlaas-ui.serviceAccountName" -}}
{{- if .Values.serviceAccount.create -}}
    {{ default (include "mlaas-ui.fullname" .) .Values.serviceAccount.name }}
{{- else -}}
    {{ default "default" .Values.serviceAccount.name }}
{{- end -}}
{{- end -}}

{{- define "imagePullSecret" }}
{{- $root := required "registry.root is required!" .Values.registry.root -}}
{{- $registryUser := required "registry.secret.username is required for imagePullSecret" .Values.registry.secret.username -}}
{{- $registryPassword := required "registry.secret.password is required for imagePullSecret" .Values.registry.secret.password -}}
{{- printf "{\"auths\": {\"%s\": {\"auth\": \"%s\"}}}" $root (printf "%s:%s" $registryUser $registryPassword | b64enc) | b64enc -}}
{{- end }}