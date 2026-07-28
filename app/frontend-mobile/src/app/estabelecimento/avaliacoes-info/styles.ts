import { StyleSheet } from "react-native";
import { colors } from "../../../constants/Colors";
import { FontFamily, FontSize } from "../../../constants/Fonts";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
  },
  header: {
    height: 48,
    justifyContent: "center",
    alignItems: "flex-start",
    paddingHorizontal: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  summaryContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  summaryTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  establishmentName: {
    fontSize: FontSize.title,
    fontFamily: FontFamily.bold,
    color: colors.textPrimary,
    flex: 1,
    marginRight: 16,
  },
  logo: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  logoPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.brown[400],
    justifyContent: "center",
    alignItems: "center",
  },
  logoPlaceholderText: {
    fontSize: FontSize.subtitle,
    fontFamily: FontFamily.bold,
    color: colors.white,
  },
  summaryBottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    fontSize: FontSize.description,
    fontFamily: FontFamily.bold,
    color: colors.textPrimary,
    marginRight: 6,
  },
  starsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  reviewsCount: {
    fontSize: FontSize.description,
    fontFamily: FontFamily.regular,
    color: colors.gray[500],
  },
  tabBar: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: colors.separator,
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabButtonActive: {
    borderBottomColor: colors.brown[800],
  },
  tabText: {
    fontSize: FontSize.body,
    fontFamily: FontFamily.medium,
    color: colors.gray[500],
  },
  tabTextActive: {
    color: colors.brown[800],
    fontFamily: FontFamily.bold,
  },
  tabContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  reviewCard: {
    borderWidth: 1,
    borderColor: colors.separator,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: FontSize.description,
    fontFamily: FontFamily.bold,
    color: colors.gray[500],
    marginBottom: 2,
  },
  reviewDate: {
    fontSize: FontSize.small,
    fontFamily: FontFamily.regular,
    color: colors.gray[500],
  },
  starsRow: {
    flexDirection: "row",
  },
  reviewComment: {
    fontSize: FontSize.description,
    fontFamily: FontFamily.regular,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  infoTabContainer: {
    flex: 1,
  },
  infoTitle: {
    fontSize: FontSize.body,
    fontFamily: FontFamily.bold,
    color: colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  hoursList: {
    marginBottom: 8,
  },
  hoursText: {
    fontSize: FontSize.description,
    fontFamily: FontFamily.regular,
    color: colors.textPrimary,
    marginBottom: 6,
    lineHeight: 20,
  },
  infoText: {
    fontSize: FontSize.description,
    fontFamily: FontFamily.regular,
    color: colors.textPrimary,
    lineHeight: 20,
    marginBottom: 8,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: FontSize.body,
    fontFamily: FontFamily.regular,
    color: colors.gray[500],
    textAlign: "center",
    marginTop: 40,
  },
});
