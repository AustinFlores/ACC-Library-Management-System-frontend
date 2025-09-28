import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "../styles/LibrarianDashboard.css";
import "../styles/ScanReturnBook.css";

function ScanReturnBook() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const COOLDOWN_MS = 5000; // 5 seconds cooldown (debounce identical scans)

  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: "", text: "" });
  const [isScanning, setIsScanning] = useState(false);

  const html5QrCodeRef = useRef(null);
  const readerDivId = "book-scanner-reader";

  // last scanned record to dedupe repeated scans
  const lastScanRef = useRef({ id: null, time: 0 });
  // holds restart timeout id so we can clear it on unmount/stop
  const restartTimeoutRef = useRef(null);

  // --- Authorization Check ---
  useEffect(() => {
    if (!user || (user.role !== "librarian" && user.role !== "admin")) {
      setStatusMessage({
        type: "error",
        text: "You are not authorized to access this page.",
      });
      setTimeout(() => navigate("/librarian/dashboard", { replace: true }), 3000);
    }
  }, [user, navigate]);

  const stopScanner = React.useCallback(async () => {
    // clear any scheduled restart to avoid concurrent starts
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }

    if (html5QrCodeRef.current && isScanning) {
      try {
        await html5QrCodeRef.current.stop();
        setIsScanning(false);
        console.log("⏹️ Scanner stopped.");
      } catch (err) {
        console.warn("⚠️ Error stopping scanner:", err);
      }
    }
  }, [isScanning]);

  // --- Init Scanner ---
  useEffect(() => {
    if (!html5QrCodeRef.current && document.getElementById(readerDivId)) {
      html5QrCodeRef.current = new Html5Qrcode(readerDivId);
      console.log("📷 Scanner instance created.");
    }

    return () => {
      // cleanup: stop scanner and clear any pending timeouts
      stopScanner()
        .then(() => {
          html5QrCodeRef.current = null;
          console.log("🧹 Scanner instance cleaned up.");
        })
        .catch(() => {
          html5QrCodeRef.current = null;
        });

      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
        restartTimeoutRef.current = null;
      }
    };
    // empty deps -> run once
  }, [stopScanner]);

  

  const startScanner = async (callback) => {
    if (!html5QrCodeRef.current || isScanning || isProcessing) return;

    const config = { fps: 10, qrbox: { width: 250, height: 250 } };

    try {
      await html5QrCodeRef.current.start(
        { facingMode: "environment" },
        config,
        callback,
        () => {}
      );
      setIsScanning(true);
      setStatusMessage({ type: "info", text: "Scan a book QR code to return it." });
      console.log("▶️ Scanner started.");
    } catch (err) {
      setStatusMessage({ type: "error", text: "Failed to start scanner." });
      console.error("❌ Scanner start error:", err);
    }
  };

  // --- Effect to control scanning ---
  useEffect(() => {
    const URL = "https://acc-library-management-system-backend-1.onrender.com";
    const qrCodeSuccessCallback = async (decodedText) => {
      // normalize scanned value early, so we can dedupe immediately
      let scannedRaw = String(decodedText ?? "").trim();
      // try parse JSON form { "book_id": "..." }
      try {
        const parsed = JSON.parse(scannedRaw);
        if (parsed && parsed.book_id) scannedRaw = String(parsed.book_id).trim();
      } catch {
        /* not JSON - keep scannedRaw */
      }

      const now = Date.now();
      // if same id scanned recently, ignore it (prevents immediate duplicate processing)
      if (
        lastScanRef.current.id &&
        lastScanRef.current.id === scannedRaw &&
        now - lastScanRef.current.time < COOLDOWN_MS
      ) {
        console.log("🔁 Ignored duplicate scan within cooldown:", scannedRaw);
        return; // ignore duplicate
      }

      // record this scan (prevents duplicates while we stop scanner)
      lastScanRef.current = { id: scannedRaw, time: now };

      // now stop and process
      await stopScanner();
      setIsProcessing(true);
      setStatusMessage({ type: "info", text: "Processing book return..." });

      try {
        const bookId = scannedRaw;
        if (!bookId) throw new Error("Invalid QR code: Missing book ID.");

        console.log("📤 Sending book_id to backend:", bookId);

        const response = await axios.post(`${URL}/api/books/return`, { book_id: bookId });

        if (response.data?.success) {
          setStatusMessage({
            type: "success",
            text: response.data.message || "Book returned successfully.",
          });
          alert(
            `✅ The book "${response.data.bookTitle || "Unknown Title"}" (ID: ${bookId}) has been returned.`
          );
        } else {
          // backend returned a payload but marked success=false
          const msg = response.data?.message || "Failed to return book.";
          setStatusMessage({ type: "error", text: msg });
          alert(`❌ Book return failed: ${msg}`);
        }
      } catch (err) {
        console.error("⚠️ Book return failed:", err);
        const errorMsg =
          err?.response?.data?.message ||
          err?.message ||
          "An error occurred while returning the book.";
        setStatusMessage({ type: "error", text: errorMsg });
        alert(`❌ Book return failed: ${errorMsg}`);
      } finally {
        setIsProcessing(false);

        // Restart scanner after cooldown, but ensure only one timeout is active
        if (restartTimeoutRef.current) {
          clearTimeout(restartTimeoutRef.current);
          restartTimeoutRef.current = null;
        }
        restartTimeoutRef.current = setTimeout(() => {
          restartTimeoutRef.current = null;
          // Update lastScanRef.time so immediate re-detection after restart is still ignored
          lastScanRef.current.time = Date.now();
          if (html5QrCodeRef.current) {
            startScanner(qrCodeSuccessCallback);
          }
        }, COOLDOWN_MS);
      }
    };

    // start scanner on mount (and whenever isProcessing flips false)
    if (!isProcessing && !isScanning) {
      startScanner(qrCodeSuccessCallback);
    }

    // cleanup handler for this effect - ensure we stop scanner when effect re-runs/unmounts
    return () => {
      stopScanner();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isProcessing]); // keep same dependency as your original code

  return (
    <div className="admin-page-content">
      <h1 className="dashboard-header">Book Return (Scan QR)</h1>
      <p className="page-description">
        Scan the QR code on a book to mark it as returned and available.
      </p>

      <div className="scan-return-book-section">
        <div className="scanner-status">
          {statusMessage.text && (
            <p className={`status-message ${statusMessage.type}`}>
              {statusMessage.text}
            </p>
          )}
        </div>

        {/* Scanner area - unchanged sizing */}
        <div
          id={readerDivId}
          className="book-scanner-reader-div"
          style={{ display: isProcessing ? "none" : "block" }}
        ></div>

        {isProcessing && (
          <div className="processing-overlay">
            <div className="spinner"></div>
            <p>Processing book return...</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ScanReturnBook;
